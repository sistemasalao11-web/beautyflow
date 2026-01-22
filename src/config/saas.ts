/**
 * CONFIGURAÇÃO DO PROPRIETÁRIO DO SAAS
 * 
 * Substitua os links abaixo pelos seus links reais do Mercado Pago ou Stripe.
 */
export const SAAS_CONFIG = {
    ownerName: "Seu Nome ou Empresa",
    supportWhatsapp: "5511999999999", // Seu WhatsApp para suporte

    // Identidade Visual
    themeColor: "#EAB308", // Yellow 500 (Ouro Puro)

    // Links de Assinatura Recorrente (Mercado Pago)
    paymentLinks: {
        iniciante: "https://www.mercadopago.com.br/subscriptions/checkout?preapproval_plan_id=d56dc89256f64bf09936b11b0ea30a52",
        profissional: "https://www.mercadopago.com.br/subscriptions/checkout?preapproval_plan_id=f2d63b741381474a9526133ff20c1378",
        elite: "https://www.mercadopago.com.br/subscriptions/checkout?preapproval_plan_id=3bb6f53605b84deb90688291dd1749f0"
    },

    // Cupons de Desconto Automáticos
    // Se o cupom for válido, o sistema trocará o link de pagamento pelo promocional
    coupons: {
        "AGENT30": {
            discountLabel: "30% OFF - Promoção de Lançamento",
            links: {
                iniciante: "https://www.mercadopago.com.br/subscriptions/checkout?preapproval_plan_id=d56dc89256f64bf09936b11b0ea30a52",
                profissional: "https://www.mercadopago.com.br/subscriptions/checkout?preapproval_plan_id=f2d63b741381474a9526133ff20c1378",
                elite: "https://www.mercadopago.com.br/subscriptions/checkout?preapproval_plan_id=3bb6f53605b84deb90688291dd1749f0"
            }
        },
        "PRIMEIRO10": {
            discountLabel: "10% OFF - Primeira Assinatura",
            links: {
                iniciante: "https://www.mercadopago.com.br/subscriptions/checkout?preapproval_plan_id=4ce5a184d8b3494ba961083bb07d9047",
                profissional: "https://www.mercadopago.com.br/subscriptions/checkout?preapproval_plan_id=301db646dcbd4401ac0120d210e1f757",
                elite: "https://www.mercadopago.com.br/subscriptions/checkout?preapproval_plan_id=85493e22a14f405ea02edff05b8c56c4"
            }
        }
    }
};
