# BeautyFlow - Sistema de Agendamento Profissional

Bem-vindo ao **BeautyFlow**, a solução definitiva para gestão de salões e barbearias focada em conversão via WhatsApp.

## 🚀 Guia de Configuração Expressa

Para começar a receber pagamentos e configurar seu negócio, siga os passos abaixo:

### 1. Configuração do Supabase (Obrigatório)
O sistema utiliza o Supabase para o banco de dados e autenticação.
1. Crie um projeto em [Supabase.com](https://supabase.com/).
2. No painel de SQL Editor, cole e execute o conteúdo do arquivo `supabase/schema.sql`.
3. Vá em **Authentication > Providers > Email** e DESATIVE "Confirm Email" para testes locais ou se não quiser que seus clientes precisem confirmar e-mail.
4. Pegue a `URL` e a `Anon Key` em **Settings > API** e insira no seu arquivo `.env`.

### 2. Configuração de Pagamentos (Seu Banco)
Você pode receber pagamentos de qualquer banco brasileiro. O sistema utiliza intermediários (Mercado Pago/Stripe) que permitem o saque para qualquer conta.

**Como configurar:**
1. Crie uma conta no [Mercado Pago](https://www.mercadopago.com.br/) ou [Stripe](https://stripe.com/br).
2. Gere links de pagamento para seus planos (Iniciante, Profissional, Elite).
3. Abra o arquivo [saas.ts](file:///c:/Users/Intel/Desktop/saasalon/src/config/saas.ts).
4. Substitua os links nos campos `paymentLinks`.

> [!IMPORTANT]
> Assim que um cliente pagar, o dinheiro cairá na sua conta do Mercado Pago/Stripe. De lá, você pode transferir para seu banco (Nubank, Itaú, Inter, etc) instantaneamente via PIX.

### 3. Identidade Visual e Contato
Edite os campos básicos para personalizar seu SaaS:
- **Nome do Proprietário:** No arquivo [saas.ts](file:///c:/Users/Intel/Desktop/saasalon/src/config/saas.ts), altere `ownerName`.
- **WhatsApp de Suporte:** Altere `supportWhatsapp` para seu número oficial.

## 🌐 Deploy (Colocando no Ar)

### Opção 1: Vercel (Recomendado)
1. Conecte seu repositório no [Vercel](https://vercel.com/).
2. Adicione as variáveis de ambiente (`VITE_SUPABASE_URL` e `VITE_SUPABASE_ANON_KEY`).
3. O build será automático (`npm run build`).

### Opção 2: Netlify
1. Suba o projeto para o [Netlify](https://www.netlify.com/).
2. Configure as mesmas variáveis de ambiente.
3. O arquivo `_redirects` já está configurado para evitar erros de rota.

## 🛠️ Tecnologias Utilizadas
- **React 19** + **TypeScript**
- **Vite** (Build ultra-rápido)
- **Tailwind CSS** (Design Premium)
- **Lucide React** (Ícones modernos)
- **Framer Motion** (Animações suaves)

---
**Design by Modern Excellence** | 2025 BeautyFlow

