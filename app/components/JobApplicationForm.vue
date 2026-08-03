<script setup lang="ts">
defineProps<{ jobTitle: string }>()
</script>

<template>
  <SubmissionForm
    :context="`Job application — ${jobTitle}`"
    success-message="Thank you for applying. We’ll be in touch."
    submit-label="Apply"
    show-portfolio
  />
</template>
