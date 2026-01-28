export interface Service {
    id: string;
    salonId: string;
    categoryId?: string;
    name: string;
    description?: string;
    price: number;
    duration: number;
    categoryName?: string;
    isPackage?: boolean;
    packageItems?: string[];
    createdAt?: string;
}

export interface Professional {
    id: string;
    salonId: string;
    name: string;
    email?: string;
    phone?: string;
    avatarUrl?: string;
    role?: string;
    servicesIds: string[];
    schedule: any[];
    bio?: string;
    portfolioUrls?: string[];
    createdAt?: string;
}

export interface Client {
    id: string;
    salonId: string;
    name: string;
    phone?: string;
    email?: string;
    totalSpent: number;
    fidelityPoints: number;
    technicalNotes?: string;
    createdAt: string;
}

export interface Product {
    id: string;
    salonId: string;
    categoryId?: string;
    name: string;
    description?: string;
    price: number;
    costPrice?: number;
    stock: number;
    minStock: number;
    imageUrl?: string;
    categoryName?: string;
    createdAt?: string;
}

export interface Appointment {
    id: string;
    salonId: string;
    clientId?: string;
    clientName: string;
    clientPhone: string;
    serviceId: string;
    serviceName: string;
    professionalId: string;
    professionalName: string;
    date: string;
    time: string;
    status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
    totalPrice: number;
    consumptionItems?: {
        id?: string;
        name: string;
        price: number;
        quantity: number;
    }[];
    notes?: string;
    createdAt?: string;
}

export interface Category {
    id: string;
    salonId: string;
    name: string;
    type: 'service' | 'product';
    createdAt?: string;
}

export interface Sale {
    id: string;
    salonId: string;
    appointmentId?: string;
    clientId?: string;
    total: number;
    paymentMethod: string;
    status: 'paid' | 'refunded' | 'pending';
    createdAt: string;
}

export interface SaleItem {
    id: string;
    saleId: string;
    itemId?: string;
    type: 'service' | 'product' | 'extra';
    name: string;
    price: number;
    quantity: number;
}

export interface AppSettings {
    salonName: string;
    whatsapp: string;
    address: string;
    messageTemplate: string;
    themeColor: string;
    themeSecondaryColor?: string;
    themeBgColor?: string;
    operatingHours: OperatingHour[];
    logoUrl?: string;
    saasDiscount?: number;
    planType: 'iniciante' | 'profissional' | 'elite';
    slug: string;
    fidelityRules?: {
        type: 'value' | 'visit';
        pointsPerUnit: number; // For 'value' it's points per R$, for 'visit' it's points per visit
    };
}

export interface OperatingHour {
    day: number;
    open: string;
    close: string;
    active: boolean;
}
