import { useSaaS } from './useSaaS';

export const useBarbers = () => {
    const { professionals, actions, loading } = useSaaS();

    return {
        barbers: professionals,
        addBarber: actions.addProfessional,
        removeBarber: actions.removeProfessional,
        updateBarber: actions.updateProfessional,
        loading
    };
};
