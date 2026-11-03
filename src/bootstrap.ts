import { createAppData } from '@/data/composition/create-app-data';

/** Instancia adaptadores de persistencia (llamar una sola vez por sesión). */
export function bootstrapAppData() {
  return createAppData();
}
