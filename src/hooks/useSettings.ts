import { useSaaS } from './useSaaS';

export const useSettings = () => {
    const { settings, actions, loading } = useSaaS();

    return {
        settings,
        updateSettings: actions.updateSettings,
        loading
    };
};
