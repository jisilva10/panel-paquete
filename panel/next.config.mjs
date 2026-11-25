/** @type {import('next').NextConfig} */
export default {
  poweredByHeader: false,
  outputFileTracingIncludes: { '/api/montar': ['./supabase/*.sql', './datos/excel.json'] },
};
