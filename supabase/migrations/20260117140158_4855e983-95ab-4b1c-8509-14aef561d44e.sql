-- Link hello@ongatacrownschool.com to Enda Sportswear as tenant admin
INSERT INTO public.tenant_users (user_id, tenant_id, is_tenant_admin)
VALUES (
  '4535e065-de3c-4e92-88a3-63d6610e4590',
  'e7872a4c-29ef-43b4-ad03-d90db64cb25d',
  true
)
ON CONFLICT (user_id, tenant_id) DO NOTHING;

-- Also update their profile to have the correct tenant_id
UPDATE public.profiles
SET tenant_id = 'e7872a4c-29ef-43b4-ad03-d90db64cb25d'
WHERE id = '4535e065-de3c-4e92-88a3-63d6610e4590';