/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_BACKEND_URL?: string;
  readonly VITE_PORTAL_TYPE?: string;
  readonly VITE_STUDENT_PORTAL_URL?: string;
  readonly VITE_TEACHER_PORTAL_URL?: string;
  readonly VITE_ADMIN_PORTAL_URL?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
