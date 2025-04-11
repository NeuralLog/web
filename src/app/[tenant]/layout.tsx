import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/services/userService';
import { isUserInTenant } from '@/services/userService';
import { setTenantId } from '@/services/tenantContext';

/**
 * Tenant-specific layout
 * 
 * This layout is used for all tenant-specific routes.
 * It verifies that the user is a member of the tenant.
 */
export default async function TenantLayout({
  params,
  children,
}: {
  params: { tenant: string };
  children: React.ReactNode;
}) {
  const tenantId = params.tenant;
  
  // Set the tenant ID in the context
  await setTenantId(tenantId);
  
  // Get the current user
  const user = await getCurrentUser();
  
  // If the user is not authenticated, they will be redirected by Clerk middleware
  if (!user) {
    redirect('/login');
  }
  
  // Check if the user is a member of the tenant
  const isMember = await isUserInTenant(user.id, tenantId);
  
  // If the user is not a member of the tenant, redirect to the home page
  if (!isMember) {
    redirect('/');
  }
  
  return (
    <div>
      <div className="tenant-header">
        <h1>Tenant: {tenantId}</h1>
      </div>
      {children}
    </div>
  );
}
