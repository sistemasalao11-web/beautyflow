import { useSaaS } from './useSaaS';
// import { Service } from '../types/saas';

export const useServices = () => {
    const { services, actions, loading } = useSaaS();

    return {
        services,
        addService: actions.addService,
        removeService: actions.removeService,
        updateService: actions.updateService,
        loading
    };
};
