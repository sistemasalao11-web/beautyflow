-- ==========================================
-- MASTER SCHEMA REGULARIZATION: BarberSaaS
-- ==========================================

-- 0. EXTENSÕES E FUNÇÕES AUXILIARES
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "btree_gist";


-- Função para verificar dono do salão
CREATE OR REPLACE FUNCTION is_salon_owner(sid UUID)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (SELECT 1 FROM salons WHERE id = sid AND owner_id = auth.uid());
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 1. ESTRUTURA (TABELAS)
-- O bloco de DROP TABLE foi removido para evitar deleção acidental de dados em produção.


-- 2. TABELA: SALONS
CREATE TABLE salons (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    owner_id UUID NOT NULL UNIQUE,
    name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    whatsapp TEXT,
    address TEXT,
    logo_url TEXT,
    plan_type TEXT DEFAULT 'iniciante' CHECK (plan_type IN ('iniciante', 'profissional', 'elite')),
    theme_color TEXT DEFAULT '#D97706',
    theme_secondary_color TEXT DEFAULT '#52525b',
    theme_bg_color TEXT DEFAULT '#09090b',
    last_payment_id TEXT,
    payment_status TEXT,
    active BOOLEAN DEFAULT TRUE,

    settings JSONB DEFAULT '{
        "messageTemplate": "Olá! Gostaria de confirmar meu agendamento.",
        "operatingHours": [
            {"day": 1, "open": "09:00", "close": "18:00", "active": true},
            {"day": 2, "open": "09:00", "close": "18:00", "active": true},
            {"day": 3, "open": "09:00", "close": "18:00", "active": true},
            {"day": 4, "open": "09:00", "close": "18:00", "active": true},
            {"day": 5, "open": "09:00", "close": "18:00", "active": true},
            {"day": 6, "open": "09:00", "close": "14:00", "active": true},
            {"day": 0, "open": "00:00", "close": "00:00", "active": false}
        ]
    }'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. TABELA: CATEGORIES
CREATE TABLE categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    salon_id UUID REFERENCES salons(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    type TEXT CHECK (type IN ('service', 'product')) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 4. TABELA: SERVICES
CREATE TABLE services (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    salon_id UUID REFERENCES salons(id) ON DELETE CASCADE,
    category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
    name TEXT NOT NULL,
    description TEXT,
    price DECIMAL(10,2) NOT NULL DEFAULT 0,
    duration INTEGER NOT NULL DEFAULT 30,
    is_package BOOLEAN DEFAULT FALSE,
    package_items UUID[] DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 5. TABELA: PROFESSIONALS
CREATE TABLE professionals (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    salon_id UUID REFERENCES salons(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    email TEXT,
    phone TEXT,
    avatar_url TEXT,
    bio TEXT,
    role TEXT DEFAULT 'Barbeiro',
    services_ids UUID[] DEFAULT '{}',
    portfolio_urls TEXT[] DEFAULT '{}',
    schedule JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 6. TABELA: PRODUCTS
CREATE TABLE products (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    salon_id UUID REFERENCES salons(id) ON DELETE CASCADE,
    category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
    name TEXT NOT NULL,
    description TEXT,
    price DECIMAL(10,2) NOT NULL DEFAULT 0,
    cost_price DECIMAL(10,2) DEFAULT 0,
    stock INTEGER DEFAULT 0,
    min_stock INTEGER DEFAULT 5,
    image_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 7. TABELA: CLIENTS (CRM)
CREATE TABLE clients (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    salon_id UUID REFERENCES salons(id) ON DELETE CASCADE,
    user_id UUID, -- Opcional: link com tabela de usuários auth se houver login de cliente
    name TEXT NOT NULL,
    phone TEXT,
    email TEXT,
    total_spent DECIMAL(10,2) DEFAULT 0,
    fidelity_points INTEGER DEFAULT 0,
    technical_notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 8. TABELA: APPOINTMENTS
CREATE TABLE appointments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    salon_id UUID REFERENCES salons(id) ON DELETE CASCADE,
    client_id UUID REFERENCES clients(id) ON DELETE SET NULL,
    client_name TEXT, -- Fallback se cliente não estiver no CRM
    client_phone TEXT,
    service_id UUID REFERENCES services(id) ON DELETE SET NULL,
    service_name TEXT,
    professional_id UUID REFERENCES professionals(id) ON DELETE SET NULL,
    professional_name TEXT,
    date DATE NOT NULL,
    time TIME NOT NULL,
    end_time TIME, -- Calculado via trigger ou app
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'completed', 'cancelled')),
    total_price DECIMAL(10,2) NOT NULL DEFAULT 0,
    consumption_items JSONB DEFAULT '[]'::jsonb,
    notes TEXT,
    points_redeemed INTEGER DEFAULT 0,
    metadata JSONB DEFAULT '{}'::jsonb, -- Armazena dados de segurança (IP, tags de bot)
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,


    -- Bloqueio de conflito de horário (Exclui se houver sobreposição no mesmo profissional/salão)
    -- Requer extensão btree_gist para funcionar com UUID e TIME
    CONSTRAINT prevent_double_booking EXCLUDE USING gist (
        salon_id WITH =,
        professional_id WITH =,
        date WITH =,
        tsrange(
            (date + time),
            (date + COALESCE(end_time, time + interval '30 minutes'))
        ) WITH &&
    ) WHERE (status != 'cancelled')
);


CREATE INDEX idx_appointments_salon_date ON appointments (salon_id, date, time);


-- ==========================================
-- TRIGGERS E FUNÇÕES DE NEGÓCIO (BACKEND SECURE)
-- ==========================================

-- Função para atualizar estatísticas do cliente e gamificação do salão
CREATE OR REPLACE FUNCTION handle_appointment_completion()
RETURNS TRIGGER AS $$
DECLARE
    v_total_spent DECIMAL(10,2);
    v_points_earned INTEGER;
    v_client_total_cuts INTEGER;
    v_current_discount INTEGER;
    v_salon_owner_id UUID;
    v_item JSONB;
BEGIN
    IF (OLD.status <> 'completed' AND NEW.status = 'completed') THEN
        -- 1. Se houver cliente vinculado, atualiza gastos e fidelidade
        IF NEW.client_id IS NOT NULL THEN
            v_points_earned := FLOOR(NEW.total_price / 10);
            
            UPDATE clients 
            SET total_spent = total_spent + NEW.total_price,
                fidelity_points = GREATEST(0, fidelity_points - COALESCE(NEW.points_redeemed, 0) + v_points_earned)
            WHERE id = NEW.client_id;


            -- 2. Verifica Gamificação (Desconto para o Salão)
            SELECT COUNT(*) INTO v_client_total_cuts FROM appointments WHERE client_id = NEW.client_id AND status = 'completed';
            
            IF (v_client_total_cuts % 20 = 0) THEN
                -- Ganhou desconto!
                UPDATE salons 
                SET settings = jsonb_set(
                    settings, 
                    '{saasDiscount}', 
                    ((COALESCE(settings->>'saasDiscount', '0')::int) + 3)::text::jsonb
                )
                WHERE id = NEW.salon_id;
            END IF;
        END IF;

        -- 3. Baixa de estoque automática via consumption_items (JSONB)
        IF NEW.consumption_items IS NOT NULL AND jsonb_array_length(NEW.consumption_items) > 0 THEN
            FOR v_item IN SELECT * FROM jsonb_array_elements(NEW.consumption_items)
            LOOP
                -- Se o item tiver um ID válido (UUID) e for do tipo produto
                IF (v_item->>'id') IS NOT NULL AND (v_item->>'type' = 'product') THEN
                    UPDATE products 
                    SET stock = GREATEST(0, stock - (v_item->>'quantity')::int)
                    WHERE id = (v_item->>'id')::uuid;
                END IF;
            END LOOP;
        END IF;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- Função de Segurança: Anti-Spam e Rate Limit
CREATE OR REPLACE FUNCTION check_appointment_security()
RETURNS TRIGGER AS $$
DECLARE
    v_recent_count INTEGER;
    v_last_creation TIMESTAMP;
BEGIN
    -- 1. Honeypot check (se houver campo de bot preenchido no metadata)
    IF (NEW.metadata->>'honeypot' IS NOT NULL AND NEW.metadata->>'honeypot' <> '') THEN
        RAISE EXCEPTION 'Atividade suspeita detectada (Bot Trap).';
    END IF;

    -- 2. Máximo de 3 agendamentos por telefone em 24h
    SELECT COUNT(*) INTO v_recent_count 
    FROM appointments 
    WHERE client_phone = NEW.client_phone 
      AND created_at > now() - interval '24 hours'
      AND status <> 'cancelled';

    IF v_recent_count >= 3 THEN
        RAISE EXCEPTION 'Limite diário de agendamentos excedido para este número.';
    END IF;

    -- 3. Cooldown de 2 minutos entre agendamentos do mesmo número
    SELECT MAX(created_at) INTO v_last_creation 
    FROM appointments 
    WHERE client_phone = NEW.client_phone;

    IF v_last_creation IS NOT NULL AND v_last_creation > now() - interval '2 minutes' THEN
        RAISE EXCEPTION 'Aguarde um momento antes de realizar outro agendamento.';
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER trg_security_check
BEFORE INSERT ON appointments
FOR EACH ROW EXECUTE FUNCTION check_appointment_security();


CREATE TRIGGER trg_complete_appointment
AFTER UPDATE ON appointments
FOR EACH ROW EXECUTE FUNCTION handle_appointment_completion();

-- Gatilho para notificação automática (Webhooks/Edge Functions)
CREATE OR REPLACE FUNCTION notify_new_appointment()
RETURNS TRIGGER AS $$
BEGIN
    -- Dispara um evento do Supabase Realtime/Webhooks que a Edge Function escuta
    PERFORM pg_notify('new_appointment_worker', json_build_object(
        'appointment_id', NEW.id,
        'salon_id', NEW.salon_id,
        'client_name', NEW.client_name,
        'date', NEW.date,
        'time', NEW.time
    )::text);
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_notify_appointment
AFTER INSERT ON appointments
FOR EACH ROW EXECUTE FUNCTION notify_new_appointment();


-- Função Universal de Auditoria
CREATE OR REPLACE FUNCTION audit_trigger_func()
RETURNS TRIGGER AS $$
BEGIN
    IF (TG_OP = 'DELETE') THEN
        INSERT INTO audit_logs (table_name, record_id, action, old_data, changed_by)
        VALUES (TG_TABLE_NAME, OLD.id, TG_OP, to_jsonb(OLD), auth.uid());
        RETURN OLD;
    ELSIF (TG_OP = 'UPDATE') THEN
        INSERT INTO audit_logs (table_name, record_id, action, old_data, new_data, changed_by)
        VALUES (TG_TABLE_NAME, NEW.id, TG_OP, to_jsonb(OLD), to_jsonb(NEW), auth.uid());
        RETURN NEW;
    ELSIF (TG_OP = 'INSERT') THEN
        INSERT INTO audit_logs (table_name, record_id, action, new_data, changed_by)
        VALUES (TG_TABLE_NAME, NEW.id, TG_OP, to_jsonb(NEW), auth.uid());
        RETURN NEW;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Aplicar Auditoria em Tabelas Críticas
CREATE TRIGGER trg_audit_salons AFTER INSERT OR UPDATE OR DELETE ON salons FOR EACH ROW EXECUTE FUNCTION audit_trigger_func();
CREATE TRIGGER trg_audit_appointments AFTER INSERT OR UPDATE OR DELETE ON appointments FOR EACH ROW EXECUTE FUNCTION audit_trigger_func();
CREATE TRIGGER trg_audit_clients AFTER INSERT OR UPDATE OR DELETE ON clients FOR EACH ROW EXECUTE FUNCTION audit_trigger_func();
CREATE TRIGGER trg_audit_professionals AFTER INSERT OR UPDATE OR DELETE ON professionals FOR EACH ROW EXECUTE FUNCTION audit_trigger_func();




-- 9. TABELA: SALES (FATURAMENTO)
CREATE TABLE sales (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    salon_id UUID REFERENCES salons(id) ON DELETE CASCADE,
    appointment_id UUID REFERENCES appointments(id) ON DELETE SET NULL,
    client_id UUID REFERENCES clients(id) ON DELETE SET NULL,
    total DECIMAL(10,2) NOT NULL DEFAULT 0,
    payment_method TEXT,
    status TEXT DEFAULT 'paid' CHECK (status IN ('paid', 'refunded', 'pending')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 10. TABELA: SALE_ITEMS
CREATE TABLE sale_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    sale_id UUID REFERENCES sales(id) ON DELETE CASCADE,
    item_id UUID, -- Link para service_id ou product_id
    type TEXT CHECK (type IN ('service', 'product', 'extra')),
    name TEXT NOT NULL,
    price DECIMAL(10,2) NOT NULL,
    quantity INTEGER DEFAULT 1
);

-- 11. TABELA: NOTIFICATION_LOGS (Auditoria de WhatsApp/SMS)
CREATE TABLE IF NOT EXISTS notification_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    appointment_id UUID REFERENCES appointments(id) ON DELETE CASCADE,
    salon_id UUID REFERENCES salons(id) ON DELETE CASCADE,
    recipient_phone TEXT NOT NULL,
    message_content TEXT,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'sent', 'failed')),
    error_message TEXT,
    retry_count INTEGER DEFAULT 0,
    sent_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 12. TABELA: AUDIT_LOGS (Rastreabilidade Total)
CREATE TABLE IF NOT EXISTS audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    table_name TEXT NOT NULL,
    record_id UUID NOT NULL,
    action TEXT NOT NULL, -- INSERT, UPDATE, DELETE
    old_data JSONB,
    new_data JSONB,
    changed_by UUID DEFAULT auth.uid(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);



-- ==========================================
-- ROW LEVEL SECURITY (RLS)
-- ==========================================

ALTER TABLE salons ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE services ENABLE ROW LEVEL SECURITY;
ALTER TABLE professionals ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE sales ENABLE ROW LEVEL SECURITY;
ALTER TABLE sale_items ENABLE ROW LEVEL SECURITY;

-- ==========================================
-- ROW LEVEL SECURITY (RLS) - POLÍTICAS REFINADAS
-- ==========================================

-- 13. VIEW PÚBLICA: SALONS_PUBLIC_VIEW (Isolamento total de JSON)
CREATE OR REPLACE VIEW salons_public_view AS
SELECT 
    id,
    name,
    slug,
    whatsapp,
    address,
    logo_url,
    theme_color,
    theme_secondary_color,
    theme_bg_color,
    (settings->'operatingHours') as operating_hours,
    active,
    created_at
FROM salons
WHERE active = true;

GRANT SELECT ON salons_public_view TO anon, authenticated;

-- SANITIZAÇÃO FINAL: Revoga qualquer acesso direto do público à tabela base salons
REVOKE SELECT ON salons FROM anon;
GRANT SELECT ON salons TO authenticated; -- Donos podem ler para fins de admin

DROP POLICY IF EXISTS "Salons_Insert_Owner" ON salons;
CREATE POLICY "Salons_Insert_Owner" ON salons FOR INSERT TO authenticated WITH CHECK (auth.uid() = owner_id);

DROP POLICY IF EXISTS "Salons_Select_Member" ON salons;
CREATE POLICY "Salons_Select_Member" ON salons FOR SELECT TO authenticated USING (auth.uid() = owner_id OR EXISTS (SELECT 1 FROM professionals WHERE salon_id = id AND email = auth.jwt()->>'email'));

DROP POLICY IF EXISTS "Salons_Update_Owner" ON salons;
CREATE POLICY "Salons_Update_Owner" ON salons FOR UPDATE TO authenticated USING (auth.uid() = owner_id);

DROP POLICY IF EXISTS "Salons_Delete_Owner" ON salons;
CREATE POLICY "Salons_Delete_Owner" ON salons FOR DELETE TO authenticated USING (auth.uid() = owner_id);

-- TABELA: CATEGORIES
DROP POLICY IF EXISTS "Admin_Categories" ON categories;
CREATE POLICY "Categories_Owner_All" ON categories FOR ALL TO authenticated USING (is_salon_owner(salon_id)) WITH CHECK (is_salon_owner(salon_id));
CREATE POLICY "Categories_Public_Select" ON categories FOR SELECT TO anon, authenticated USING (true);


-- TABELA: SERVICES
DROP POLICY IF EXISTS "Admin_Services" ON services;
CREATE POLICY "Services_Owner_All" ON services FOR ALL TO authenticated USING (is_salon_owner(salon_id)) WITH CHECK (is_salon_owner(salon_id));
CREATE POLICY "Services_Public_Select" ON services FOR SELECT TO anon, authenticated USING (true); -- Permitir ver serviços para agendar

-- TABELA: PROFESSIONALS
DROP POLICY IF EXISTS "Admin_Professionals" ON professionals;
CREATE POLICY "Professionals_Owner_All" ON professionals FOR ALL TO authenticated USING (is_salon_owner(salon_id)) WITH CHECK (is_salon_owner(salon_id));
CREATE POLICY "Professionals_Self_Select" ON professionals FOR SELECT TO authenticated USING (email = auth.jwt()->>'email');
CREATE POLICY "Professionals_Public_Select" ON professionals FOR SELECT TO anon, authenticated USING (true);


-- TABELA: PRODUCTS
DROP POLICY IF EXISTS "Admin_Products" ON products;
CREATE POLICY "Products_Owner_All" ON products FOR ALL TO authenticated USING (is_salon_owner(salon_id)) WITH CHECK (is_salon_owner(salon_id));

-- TABELA: CLIENTS
DROP POLICY IF EXISTS "Admin_Clients" ON clients;
CREATE POLICY "Clients_Owner_All" ON clients FOR ALL TO authenticated USING (is_salon_owner(salon_id)) WITH CHECK (is_salon_owner(salon_id));

-- TABELA: APPOINTMENTS
DROP POLICY IF EXISTS "Admin_Appointments" ON appointments;
DROP POLICY IF EXISTS "Appointments_Insert_Client" ON appointments;
DROP POLICY IF EXISTS "Appointments_Owner_All" ON appointments;
DROP POLICY IF EXISTS "Appointments_Client_Select" ON appointments;
DROP POLICY IF EXISTS "Appointments_Prof_Select" ON appointments;

CREATE POLICY "Appointments_Public_Insert" ON appointments FOR INSERT TO anon, authenticated WITH CHECK (true); 
CREATE POLICY "Appointments_Member_Select" ON appointments FOR SELECT TO authenticated USING (
    is_salon_owner(salon_id) OR 
    professional_id IN (SELECT id FROM professionals WHERE email = auth.jwt()->>'email')
);
CREATE POLICY "Appointments_Member_Update" ON appointments FOR UPDATE TO authenticated USING (
    is_salon_owner(salon_id) OR 
    professional_id IN (SELECT id FROM professionals WHERE email = auth.jwt()->>'email')
);


-- TABELA: SALES
DROP POLICY IF EXISTS "Admin_Sales" ON sales;
CREATE POLICY "Sales_Owner_All" ON sales FOR ALL TO authenticated USING (is_salon_owner(salon_id)) WITH CHECK (is_salon_owner(salon_id));

-- TABELA: SALE_ITEMS
DROP POLICY IF EXISTS "Admin_SaleItems" ON sale_items;
CREATE POLICY "SaleItems_Owner_All" ON sale_items FOR ALL TO authenticated USING (
    EXISTS (SELECT 1 FROM sales WHERE id = sale_id AND is_salon_owner(salon_id))
);

-- NOTIFICAR SCHEMA RELOAD
NOTIFY pgrst, 'reload schema';
