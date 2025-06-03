import HomePage from 'pages/HomePage.vue'
import About from 'pages/About.vue'
import ContactsPage from 'pages/Contacts.vue'

const routes = [
  {
    path: '/login',
    component: () => import('pages/Login.vue'),
  },

  {
    path: '/',
    component: () => import('layouts/MainLayout.vue'),
    meta: { requiresAuth: true },
    children: [
      { path: '', component: HomePage },
      { path: 'about', component: About },
      { path: 'contacts', component: ContactsPage },
    ],
  },

  {
    path: '/:catchAll(.*)*',
    component: () => import('pages/ErrorNotFound.vue'),
  },
]

export default routes
