<template>
  <nav aria-label="Main navigation">
    <NuxtLink to="/cases">Cases</NuxtLink>
    <NuxtLink to="/about">About</NuxtLink>
    <NuxtLink to="/jobs">Jobs</NuxtLink>
    <NuxtLink to="/contact">Contact</NuxtLink>
  </nav>
</template>

<style scoped>
nav {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 2px;
}

.router-link-exact-active {
  opacity: .45;
}

nav a:focus-visible {
  outline: none;
  background: var(--accent);
  opacity: 1;
}

@media (forced-colors: active) {
  nav a:focus-visible {
    outline: 2px solid CanvasText;
    outline-offset: 2px;
  }
}

@media (max-width: 720px) {
  nav {
    flex-flow: row wrap;
    justify-content: flex-end;
    gap: 4px 12px;
  }
}
</style>
