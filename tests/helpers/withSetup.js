import { createApp, defineComponent, h } from 'vue';

/**
 * Mounts a real Vue component that calls a composable in setup().
 * This is needed for composables that use Vue lifecycle hooks or vee-validate's useForm().
 *
 * Usage:
 *   const { result, unmount } = withSetup(useBaseListing, [props]);
 *   // result contains everything the composable returns
 *   // Always call unmount() in afterEach to clean up intervals/listeners
 */
export function withSetup(composable, args = []) {
    let result;
    const TestComponent = defineComponent({
        setup() {
            result = composable(...args);
            return () => h('div');
        },
    });
    const app = createApp(TestComponent);
    const el = document.createElement('div');
    app.mount(el);
    return { result, app, unmount: () => app.unmount() };
}
