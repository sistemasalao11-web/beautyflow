import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from './AuthContext';
import { toast } from 'react-hot-toast';
import type {
    Appointment,
    Product,
    Professional,
    Service,
    Category,
    Sale,
    AppSettings,
    Client
} from '../types/saas';

export type BootStatus = 'loading' | 'syncing' | 'ready' | 'no-salon' | 'error';

interface SaaSContextType {
    salon: any;
    appointments: Appointment[];
    products: Product[];
    professionals: Professional[];
    services: Service[];
    categories: Category[];
    sales: Sale[];
    clients: Client[];
    settings: AppSettings | null;
    loading: boolean;
    status: BootStatus;
    error: string | null;
    metrics: any;
    permissions: any;
    actions: {
        refresh: () => Promise<void>;
        updateSettings: (s: AppSettings) => Promise<void>;
        addService: (s: any) => Promise<any>;
        updateService: (id: string, s: any) => Promise<any>;
        removeService: (id: string) => Promise<void>;
        addProfessional: (p: any) => Promise<any>;
        updateProfessional: (id: string, p: any) => Promise<any>;
        removeProfessional: (id: string) => Promise<void>;
        addProduct: (p: any) => Promise<any>;
        updateProduct: (id: string, p: any) => Promise<any>;
        removeProduct: (id: string) => Promise<void>;
        addAppointment: (a: any) => Promise<any>;
        updateStatus: (id: string, status: string) => Promise<void>;
        addClient: (c: any) => Promise<any>;
        updateClient: (id: string, c: any) => Promise<any>;
        removeClient: (id: string) => Promise<void>;
        addConsumptionItem: (appointmentId: string, item: any) => Promise<void>;
        completeAppointment: (appointmentId: string, paymentMethod: string, discount?: number, pointsRedeemed?: number) => Promise<boolean>;
        activatePlan: (paymentId: string) => Promise<void>;
    };
}

const SaaSContext = createContext<SaaSContextType | undefined>(undefined);

const isValidUUID = (uuid: any) => {
    if (typeof uuid !== 'string') return false;
    return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-5][0-9a-f]{3}-[089ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(uuid);
};

const mapToFrontend = (data: any) => {
    if (!data) return null;
    const mapped: any = {};
    Object.entries(data).forEach(([key, val]) => {
        const camelKey = key.replace(/(_\w)/g, m => m[1].toUpperCase());
        mapped[camelKey] = val;
    });
    return mapped;
};

const mapToBackend = (data: any) => {
    const dbData: any = {};
    Object.entries(data).forEach(([key, val]) => {
        const snakeKey = key.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);
        if (key.endsWith('Id') || snakeKey.endsWith('_id') || key === 'id') {
            if (val === '' || val === undefined || val === null || !isValidUUID(val)) {
                if (key === 'id') return;
                dbData[snakeKey] = null;
                return;
            }
        }
        dbData[snakeKey] = val;
    });
    return dbData;
};

export const SaaSProvider: React.FC<{ children: React.ReactNode, slug?: string }> = ({ children, slug }) => {
    const { user, loading: authLoading } = useAuth();
    const [status, setStatus] = useState<BootStatus>('loading');
    const [error, setError] = useState<string | null>(null);
    const [salon, setSalon] = useState<any>(null);
    const [appointments, setAppointments] = useState<Appointment[]>([]);
    const [products, setProducts] = useState<Product[]>([]);
    const [professionals, setProfessionals] = useState<Professional[]>([]);
    const [services, setServices] = useState<Service[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [sales, setSales] = useState<Sale[]>([]);
    const [clients, setClients] = useState<Client[]>([]);
    const [settings, setSettings] = useState<AppSettings | null>(null);

    const fetchData = useCallback(async () => {
        if (authLoading) {
            console.log('[BOOT] Waiting for AuthContext...');
            setStatus('loading');
            return;
        }

        if (!user && !slug) {
            console.log('[BOOT] No user or slug. Standing by.');
            setStatus('no-salon');
            return;
        }

        setStatus('syncing');
        console.log('[BOOT] Syncing Tenant Data...', { userId: user?.id, slug });

        try {
            let salonData: any = null;

            if (user) {
                // Issue 3 fix: Always use limit(1) to prevent PGRST116
                const { data, error: sError } = await supabase
                    .from('salons')
                    .select('*')
                    .eq('owner_id', user.id)
                    .order('created_at', { ascending: true })
                    .limit(1);

                if (sError) throw sError;
                salonData = data?.[0] || null;

                if (!salonData) {
                    console.warn('[BOOT] No profile found for user.');
                    setStatus('no-salon');
                    return;
                }
            } else if (slug) {
                const { data, error: sError } = await supabase
                    .from('salons')
                    .select('*')
                    .eq('slug', slug)
                    .limit(1);
                if (sError) throw sError;
                salonData = data?.[0] || null;
            }

            if (!salonData) {
                console.error('[BOOT] Tenant resolution failed.');
                setStatus('no-salon');
                return;
            }

            console.log('[BOOT] Tenant resolved:', salonData.name);
            setSalon(salonData);
            setSettings({
                salonName: salonData.name,
                whatsapp: salonData.whatsapp || '',
                messageTemplate: salonData.settings?.messageTemplate || '',
                address: salonData.address || '',
                themeColor: salonData.theme_color || '#EAB308',
                themeSecondaryColor: salonData.theme_secondary_color || '#52525b',
                themeBgColor: salonData.theme_bg_color || '#09090b',
                operatingHours: salonData.settings?.operatingHours || [],
                logoUrl: salonData.logo_url,
                saasDiscount: salonData.settings?.saasDiscount || 0,
                planType: salonData.plan_type || 'iniciante',
                slug: salonData.slug
            });

            const sId = salonData.id;
            console.log('[BOOT] Fetching ecosystem data for:', sId);
            const [appts, prods, profs, servs, cats, sles, clnts] = await Promise.all([
                supabase.from('appointments').select('*, clients(name, phone), services(name, price), professionals(name)').eq('salon_id', sId).order('date', { ascending: false }),
                supabase.from('products').select('*, categories(name)').eq('salon_id', sId),
                supabase.from('professionals').select('*').eq('salon_id', sId),
                supabase.from('services').select('*, categories(name)').eq('salon_id', sId),
                supabase.from('categories').select('*').eq('salon_id', sId),
                supabase.from('sales').select('*').eq('salon_id', sId),
                supabase.from('clients').select('*').eq('salon_id', sId)
            ]);

            setAppointments((appts.data || []).map(a => ({
                ...mapToFrontend(a),
                clientName: a.clients?.name,
                clientPhone: a.clients?.phone,
                serviceName: a.services?.name,
                totalPrice: a.total_price || a.services?.price || 0,
                professionalName: a.professionals?.name
            })));
            setProducts((prods.data || []).map(p => ({ ...mapToFrontend(p), categoryName: p.categories?.name })));
            setServices((servs.data || []).map(s => ({ ...mapToFrontend(s), categoryName: s.categories?.name })));
            setProfessionals((profs.data || []).map(mapToFrontend));
            setCategories((cats.data || []).map(mapToFrontend));
            setSales((sles.data || []).map(mapToFrontend));
            setClients((clnts.data || []).map(mapToFrontend));

            console.log('[BOOT] Ecosystem READY.');
            setStatus('ready');
        } catch (err: any) {
            console.error('[BOOT] FATAL SYSTEM ERROR:', err);
            setError(err.message);
            setStatus('error');
        }
    }, [user, slug, authLoading]);

    useEffect(() => { fetchData(); }, [fetchData]);

    // Fast reset on logout
    useEffect(() => {
        if (!user && !authLoading && !slug) {
            console.log('[BOOT] Post-Logout Reset Triggered.');
            setSalon(null);
            setAppointments([]);
            setProducts([]);
            setProfessionals([]);
            setServices([]);
            setCategories([]);
            setSales([]);
            setClients([]);
            setSettings(null);
            setStatus('no-salon');
        }
    }, [user, authLoading, slug]);

    useEffect(() => {
        if (!salon?.id) return;
        const sub = supabase.channel(`saas-${salon.id}`)
            .on('postgres_changes', { event: '*', schema: 'public', filter: `salon_id=eq.${salon.id}` }, fetchData)
            .subscribe();
        return () => { sub.unsubscribe(); };
    }, [salon?.id, fetchData]);

    const upsert = async (table: string, data: any) => {
        if (!salon) return;
        const loadingToast = toast.loading('Salvando...');
        try {
            const dbData = mapToBackend({ ...data, salonId: salon.id });
            const { data: result, error: upsertError } = await supabase.from(table).upsert(dbData).select().limit(1);
            if (upsertError) throw upsertError;
            toast.success('Salvo!', { id: loadingToast });
            fetchData();
            return mapToFrontend(result?.[0]);
        } catch (e: any) {
            toast.error(`Erro: ${e.message}`, { id: loadingToast });
            throw e;
        }
    };

    const remove = async (table: string, id: string) => {
        const loadingToast = toast.loading('Removendo...');
        try {
            const { error: delError } = await supabase.from(table).delete().eq('id', id);
            if (delError) throw delError;
            toast.success('Removido!', { id: loadingToast });
            fetchData();
        } catch (e: any) {
            toast.error(`Erro: ${e.message}`, { id: loadingToast });
        }
    };

    const metrics = useMemo(() => {
        const completedAppts = appointments.filter(a => a.status === 'completed');
        const totalRevenue = completedAppts.reduce((sum, a) => {
            const consumptionTotal = (a.consumptionItems || []).reduce((s: number, i: any) => s + (Number(i.price || 0) * Number(i.quantity || 0)), 0);
            return sum + (Number(a.totalPrice || 0) + consumptionTotal);
        }, 0);
        const completionRate = appointments.length > 0 ? (completedAppts.length / appointments.length) * 100 : 0;
        const todayStr = new Date().toISOString().split('T')[0];

        // --- NOVAS MÉTRICAS DE GROWTH SaaS ---

        // 1. Retenção de Clientes (% que voltou mais de uma vez)
        const clientApptCounts = appointments.reduce((acc: any, curr) => {
            if (curr.clientId) acc[curr.clientId] = (acc[curr.clientId] || 0) + 1;
            return acc;
        }, {});
        const recurringClients = Object.values(clientApptCounts).filter((count: any) => count > 1).length;
        const totalClientsWithAppts = Object.keys(clientApptCounts).length;
        const retentionRate = totalClientsWithAppts > 0 ? (recurringClients / totalClientsWithAppts) * 100 : 0;

        // 2. Churn Risk (Clientes que não aparecem há 45 dias)
        const fortyFiveDaysAgo = new Date();
        fortyFiveDaysAgo.setDate(fortyFiveDaysAgo.getDate() - 45);
        const churnRiskClients = clients.filter(c => {
            const lastAppt = appointments.find(a => a.clientId === c.id);
            if (!lastAppt) return false;
            return new Date(lastAppt.date) < fortyFiveDaysAgo;
        });

        // 3. Status de Ativação (Health Score do Salão)
        const hasServices = services.length > 0;
        const hasProfessionals = professionals.length > 0;
        const hasAppointments = appointments.length > 0;
        const activationScore = [hasServices, hasProfessionals, hasAppointments].filter(Boolean).length * 33.3;

        return {
            totalRevenue,
            totalAppointments: appointments.length,
            completionRate,
            retentionRate,
            activationScore,
            churnRiskCount: churnRiskClients.length,
            averageTicket: completedAppts.length > 0 ? totalRevenue / completedAppts.length : 0,
            statusToday: {
                pending: appointments.filter(a => a.date === todayStr && a.status === 'pending').length,
                completed: appointments.filter(a => a.date === todayStr && a.status === 'completed').length,
                cancelled: appointments.filter(a => a.date === todayStr && a.status === 'cancelled').length,
                lists: {
                    pending: appointments.filter(a => a.date === todayStr && a.status === 'pending'),
                    completed: appointments.filter(a => a.date === todayStr && a.status === 'completed')
                }
            },
            details: {
                revenue: completedAppts.map(a => ({
                    id: a.id,
                    client: a.clientName,
                    service: a.serviceName,
                    value: (Number(a.totalPrice || 0)) + (a.consumptionItems || []).reduce((s: number, i: any) => s + (Number(i.price || 0) * Number(i.quantity || 0)), 0),
                    date: a.date
                })),
                appointments: appointments.map(a => ({
                    id: a.id,
                    client: a.clientName,
                    service: a.serviceName,
                    status: a.status,
                    time: a.time
                })),
                churnRisk: churnRiskClients.map(c => ({
                    id: c.id,
                    name: c.name,
                    phone: c.phone
                }))
            }
        };
    }, [appointments, clients, services, professionals]);

    const permissions = useMemo(() => {
        const plan = settings?.planType || 'iniciante';
        const createdAt = salon?.created_at ? new Date(salon.created_at) : new Date();
        const now = new Date();
        const diffDays = Math.floor((now.getTime() - createdAt.getTime()) / (1000 * 60 * 60 * 24));
        const trialDurationDays = 7;
        const trialDaysRemaining = Math.max(0, trialDurationDays - diffDays);
        const isApproved = salon?.payment_status === 'approved';
        const isTrial = !isApproved;
        const isTrialExpired = isTrial && diffDays >= trialDurationDays;
        const effectivePlan = (isTrial && !isTrialExpired) ? 'elite' : plan;

        return {
            plan: effectivePlan,
            maxProfessionals: effectivePlan === 'iniciante' ? 1 : effectivePlan === 'profissional' ? 5 : 999,
            canAccessInventory: effectivePlan !== 'iniciante',
            canAccessReports: effectivePlan !== 'iniciante',
            isElite: effectivePlan === 'elite',
            isTrial,
            isTrialExpired,
            trialDaysRemaining
        };
    }, [settings?.planType, salon?.created_at, salon?.payment_status]);

    const value = {
        salon, appointments, products, professionals, services, categories, sales, clients, settings,
        loading: status === 'loading' || status === 'syncing',
        status,
        error,
        metrics, permissions,
        actions: {
            refresh: fetchData,
            updateSettings: async (s: AppSettings) => {
                if (!salon) return;
                const loadingToast = toast.loading('Salvando...');
                try {
                    const { error: updError } = await supabase.from('salons').update({
                        name: s.salonName, whatsapp: s.whatsapp, address: s.address,
                        theme_color: s.themeColor, theme_secondary_color: s.themeSecondaryColor, theme_bg_color: s.themeBgColor,
                        logo_url: s.logoUrl,
                        settings: { messageTemplate: s.messageTemplate, operatingHours: s.operatingHours, saasDiscount: s.saasDiscount }
                    }).eq('id', salon.id);
                    if (updError) throw updError;
                    toast.success('Salvo!', { id: loadingToast });
                    fetchData();
                } catch (e: any) { toast.error(e.message, { id: loadingToast }); }
            },
            addService: (s: any) => upsert('services', s),
            updateService: (id: string, s: any) => upsert('services', { ...s, id }),
            removeService: (id: string) => remove('services', id),
            addProfessional: async (p: any) => {
                if (professionals.length >= permissions.maxProfessionals) {
                    toast.error(`Limite atingido.`); throw new Error('Limit');
                }
                return upsert('professionals', p);
            },
            updateProfessional: (id: string, p: any) => upsert('professionals', { ...p, id }),
            removeProfessional: (id: string) => remove('professionals', id),
            addProduct: (p: any) => upsert('products', p),
            updateProduct: (id: string, p: any) => upsert('products', { ...p, id }),
            removeProduct: (id: string) => remove('products', id),
            addAppointment: (a: any) => upsert('appointments', a),
            updateStatus: async (id: string, statusText: string) => {
                const { error: updError } = await supabase.from('appointments').update({ status: statusText }).eq('id', id);
                if (updError) toast.error('Erro'); else fetchData();
            },
            addClient: (c: any) => upsert('clients', c),
            updateClient: (id: string, c: any) => upsert('clients', { ...c, id }),
            removeClient: (id: string) => remove('clients', id),
            addConsumptionItem: async (appointmentId: string, item: any) => {
                const appt = appointments.find(a => a.id === appointmentId);
                if (!appt) return;
                const newItems = [...(appt.consumptionItems || []), item];
                const { error: updError } = await supabase.from('appointments').update({ consumption_items: newItems }).eq('id', appointmentId);
                if (!updError) fetchData();
            },
            completeAppointment: async (appointmentId: string, paymentMethod: string, discount: number = 0, pointsRedeemed: number = 0) => {
                const appt = appointments.find(a => a.id === appointmentId);
                if (!appt) return false;
                const loadingToast = toast.loading('Finalizando...');
                try {
                    const consumptionTotal = (appt.consumptionItems || []).reduce((s: number, i: any) => s + (i.price * i.quantity), 0);
                    const finalTotal = Math.max(0, appt.totalPrice + consumptionTotal - discount);
                    await supabase.from('appointments').update({ status: 'completed', total_price: finalTotal, points_redeemed: pointsRedeemed }).eq('id', appointmentId);
                    await supabase.from('sales').insert({ salon_id: salon.id, appointment_id: appointmentId, client_id: appt.clientId, total: finalTotal, payment_method: paymentMethod, status: 'paid' });
                    toast.success('Atendimento concluído!', { id: loadingToast });
                    fetchData();
                    return true;
                } catch (e) { toast.error('Erro ao finalizar', { id: loadingToast }); return false; }
            },
            activatePlan: async (paymentId: string) => {
                if (!salon) return;
                await supabase.from('salons').update({ payment_status: 'approved', last_payment_id: paymentId, plan_type: 'profissional' }).eq('id', salon.id);
                fetchData();
            }
        }
    };

    return <SaaSContext.Provider value={value}>{children}</SaaSContext.Provider>;
};

export const useSaaS = () => {
    const context = useContext(SaaSContext);
    if (context === undefined) {
        console.error('[CRITICAL] useSaaS called outside SaaSProvider.');
        // Return a dummy object to prevent destructuring crashes
        return {
            salon: null,
            appointments: [],
            products: [],
            professionals: [],
            services: [],
            categories: [],
            sales: [],
            clients: [],
            settings: null,
            loading: true,
            status: 'loading',
            error: null,
            metrics: {},
            permissions: {},
            actions: {}
        } as any;
    }
    return context;
};
