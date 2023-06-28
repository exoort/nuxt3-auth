<script setup lang="ts">
import {
  onBeforeMount, ref, useRoute,
} from '#imports';
import { useAuth } from '../composables/useAuth';

const props = defineProps<{
  currentProvider: string,
}>();

const emit = defineEmits<{
  (e: 'successSignIn', payload: {
    provider: string,
    payload: any,
  }): void,

  (e: 'failSignIn', payload: {
    provider: string,
    payload: any,
  }): void,
}>();

const loading = ref(true);

const route = useRoute();

type StatusType = 'success' | 'fail';
const status = ref<StatusType>();

async function tryToAuthorize() {
  // const provider = await useAuthConfig().getOauthProvider(props.currentProvider);
  // TODO: implement get current provider from plugin
  const provider = null;

  if (!provider) {
    status.value = 'fail';
    emit('failSignIn', {
      provider,
      payload: {
        provider,
      },
    });
    return;
  }

  try {
    loading.value = true;

    const payload = await provider.callback(route.query);

    await useAuth().refreshSession();

    status.value = 'success';

    emit('successSignIn', {
      provider: props.currentProvider,
      payload,
    });
  } catch (error) {
    status.value = 'fail';

    emit('failSignIn', {
      provider: props.currentProvider,
      payload: provider.createError(error, route.query),
    });
  } finally {
    loading.value = false;
  }
}

onBeforeMount(async () => {
  await tryToAuthorize();
});
</script>

<template>
  <slot
    :loading="loading"
    :status="status"
  />
</template>
