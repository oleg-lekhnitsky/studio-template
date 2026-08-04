<script setup lang="ts">
import type { FormField } from '~/types/sanity'

defineProps<{ jobTitle: string; fields?: FormField[] }>()
</script>

<template>
  <SubmissionForm
    :context="`Job application — ${jobTitle}`"
    success-message="Thank you for applying. We’ll be in touch."
    submit-label="Apply"
    show-portfolio
    :fields="fields"
  />
</template>
