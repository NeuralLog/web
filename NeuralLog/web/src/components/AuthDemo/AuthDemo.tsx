'use client';

import React, { useState } from 'react';
import { 
  Box, 
  Heading, 
  Text, 
  Button, 
  VStack, 
  HStack, 
  Divider, 
  Badge, 
  useToast,
  Select,
  Input,
  FormControl,
  FormLabel
} from '@chakra-ui/react';
import { useAuth, Permission, ResourceType, PermissionGuard } from '@/sdk/auth';
import { useUserContext } from '@/providers/UserProvider';
import { useTenantContext } from '@/providers/TenantProvider';

export function AuthDemo() {
  const { 
    isInitialized, 
    isInitializing, 
    error,
    checkPermission,
    grantPermission,
    revokePermission,
    isUserInTenant,
    isUserTenantAdmin,
    addUserToTenant,
    removeUserFromTenant,
    updateUserRole
  } = useAuth();
  
  const { user } = useUserContext();
  const { tenantId } = useTenantContext();
  const toast = useToast();
  
  const [selectedPermission, setSelectedPermission] = useState<Permission>(Permission.READ);
  const [selectedResourceType, setSelectedResourceType] = useState<ResourceType>(ResourceType.LOG);
  const [resourceId, setResourceId] = useState<string>('system-logs');
  const [checkResult, setCheckResult] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  
  // Check permission
  const handleCheckPermission = async () => {
    if (!user) {
      toast({
        title: 'No user',
        description: 'You need to be logged in to check permissions',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      return;
    }
    
    setIsLoading(true);
    
    try {
      const result = await checkPermission(
        user.id,
        selectedPermission,
        selectedResourceType,
        resourceId
      );
      
      setCheckResult(result);
      
      toast({
        title: result ? 'Permission granted' : 'Permission denied',
        status: result ? 'success' : 'warning',
        duration: 3000,
        isClosable: true,
      });
    } catch (err) {
      console.error('Error checking permission:', err);
      toast({
        title: 'Error',
        description: 'Failed to check permission',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  // Grant permission
  const handleGrantPermission = async () => {
    if (!user) {
      toast({
        title: 'No user',
        description: 'You need to be logged in to grant permissions',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      return;
    }
    
    setIsLoading(true);
    
    try {
      const result = await grantPermission(
        user.id,
        selectedPermission,
        selectedResourceType,
        resourceId
      );
      
      if (result) {
        toast({
          title: 'Permission granted',
          description: `Granted ${selectedPermission} permission on ${selectedResourceType}:${resourceId}`,
          status: 'success',
          duration: 3000,
          isClosable: true,
        });
        
        // Update check result
        setCheckResult(true);
      } else {
        toast({
          title: 'Failed to grant permission',
          status: 'error',
          duration: 3000,
          isClosable: true,
        });
      }
    } catch (err) {
      console.error('Error granting permission:', err);
      toast({
        title: 'Error',
        description: 'Failed to grant permission',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  // Revoke permission
  const handleRevokePermission = async () => {
    if (!user) {
      toast({
        title: 'No user',
        description: 'You need to be logged in to revoke permissions',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      return;
    }
    
    setIsLoading(true);
    
    try {
      const result = await revokePermission(
        user.id,
        selectedPermission,
        selectedResourceType,
        resourceId
      );
      
      if (result) {
        toast({
          title: 'Permission revoked',
          description: `Revoked ${selectedPermission} permission on ${selectedResourceType}:${resourceId}`,
          status: 'success',
          duration: 3000,
          isClosable: true,
        });
        
        // Update check result
        setCheckResult(false);
      } else {
        toast({
          title: 'Failed to revoke permission',
          status: 'error',
          duration: 3000,
          isClosable: true,
        });
      }
    } catch (err) {
      console.error('Error revoking permission:', err);
      toast({
        title: 'Error',
        description: 'Failed to revoke permission',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  // Check if user is in tenant
  const handleCheckTenantMembership = async () => {
    if (!user) {
      toast({
        title: 'No user',
        description: 'You need to be logged in to check tenant membership',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      return;
    }
    
    setIsLoading(true);
    
    try {
      const result = await isUserInTenant(user.id);
      
      toast({
        title: result ? 'User is a tenant member' : 'User is not a tenant member',
        status: result ? 'success' : 'warning',
        duration: 3000,
        isClosable: true,
      });
    } catch (err) {
      console.error('Error checking tenant membership:', err);
      toast({
        title: 'Error',
        description: 'Failed to check tenant membership',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  // Check if user is tenant admin
  const handleCheckTenantAdmin = async () => {
    if (!user) {
      toast({
        title: 'No user',
        description: 'You need to be logged in to check tenant admin status',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      return;
    }
    
    setIsLoading(true);
    
    try {
      const result = await isUserTenantAdmin(user.id);
      
      toast({
        title: result ? 'User is a tenant admin' : 'User is not a tenant admin',
        status: result ? 'success' : 'warning',
        duration: 3000,
        isClosable: true,
      });
    } catch (err) {
      console.error('Error checking tenant admin status:', err);
      toast({
        title: 'Error',
        description: 'Failed to check tenant admin status',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <Box p={6} borderWidth={1} borderRadius="lg" shadow="md">
      <Heading size="lg" mb={4}>Auth SDK Demo</Heading>
      
      <VStack spacing={4} align="stretch">
        {/* Status */}
        <Box>
          <Text fontWeight="bold">Status:</Text>
          <HStack mt={2}>
            <Badge colorScheme={isInitialized ? 'green' : 'yellow'}>
              {isInitializing ? 'Initializing...' : isInitialized ? 'Initialized' : 'Not Initialized'}
            </Badge>
            
            {error && (
              <Badge colorScheme="red">Error: {error.message}</Badge>
            )}
          </HStack>
        </Box>
        
        <Divider />
        
        {/* User Info */}
        <Box>
          <Text fontWeight="bold">User:</Text>
          {user ? (
            <Text mt={2}>
              {user.firstName} {user.lastName} ({user.id})
            </Text>
          ) : (
            <Text mt={2} color="gray.500">Not logged in</Text>
          )}
        </Box>
        
        <Divider />
        
        {/* Tenant Info */}
        <Box>
          <Text fontWeight="bold">Tenant:</Text>
          {tenantId ? (
            <Text mt={2}>{tenantId}</Text>
          ) : (
            <Text mt={2} color="gray.500">No tenant selected</Text>
          )}
        </Box>
        
        <Divider />
        
        {/* Permission Check Form */}
        <Box>
          <Heading size="md" mb={3}>Check/Manage Permissions</Heading>
          
          <VStack spacing={4} align="stretch">
            <FormControl>
              <FormLabel>Permission</FormLabel>
              <Select
                value={selectedPermission}
                onChange={(e) => setSelectedPermission(e.target.value as Permission)}
              >
                {Object.values(Permission).map((permission) => (
                  <option key={permission} value={permission}>
                    {permission}
                  </option>
                ))}
              </Select>
            </FormControl>
            
            <FormControl>
              <FormLabel>Resource Type</FormLabel>
              <Select
                value={selectedResourceType}
                onChange={(e) => setSelectedResourceType(e.target.value as ResourceType)}
              >
                {Object.values(ResourceType).map((resourceType) => (
                  <option key={resourceType} value={resourceType}>
                    {resourceType}
                  </option>
                ))}
              </Select>
            </FormControl>
            
            <FormControl>
              <FormLabel>Resource ID</FormLabel>
              <Input
                value={resourceId}
                onChange={(e) => setResourceId(e.target.value)}
                placeholder="e.g., system-logs"
              />
            </FormControl>
            
            <HStack spacing={4}>
              <Button
                colorScheme="blue"
                onClick={handleCheckPermission}
                isLoading={isLoading}
                isDisabled={!isInitialized || !user}
              >
                Check Permission
              </Button>
              
              <Button
                colorScheme="green"
                onClick={handleGrantPermission}
                isLoading={isLoading}
                isDisabled={!isInitialized || !user}
              >
                Grant Permission
              </Button>
              
              <Button
                colorScheme="red"
                onClick={handleRevokePermission}
                isLoading={isLoading}
                isDisabled={!isInitialized || !user}
              >
                Revoke Permission
              </Button>
            </HStack>
            
            {checkResult !== null && (
              <Badge
                alignSelf="flex-start"
                colorScheme={checkResult ? 'green' : 'red'}
                p={2}
                borderRadius="md"
              >
                {checkResult ? 'Permission Granted' : 'Permission Denied'}
              </Badge>
            )}
          </VStack>
        </Box>
        
        <Divider />
        
        {/* Tenant Membership */}
        <Box>
          <Heading size="md" mb={3}>Tenant Membership</Heading>
          
          <HStack spacing={4}>
            <Button
              colorScheme="blue"
              onClick={handleCheckTenantMembership}
              isLoading={isLoading}
              isDisabled={!isInitialized || !user || !tenantId}
            >
              Check Tenant Membership
            </Button>
            
            <Button
              colorScheme="blue"
              onClick={handleCheckTenantAdmin}
              isLoading={isLoading}
              isDisabled={!isInitialized || !user || !tenantId}
            >
              Check Tenant Admin
            </Button>
          </HStack>
        </Box>
        
        <Divider />
        
        {/* Permission Guard Demo */}
        <Box>
          <Heading size="md" mb={3}>Permission Guard Demo</Heading>
          
          <PermissionGuard
            permission={Permission.READ}
            resourceType={ResourceType.LOG}
            resourceId="system-logs"
            fallback={
              <Box p={4} bg="red.100" borderRadius="md">
                <Text>You don't have permission to view system logs.</Text>
                <Button
                  mt={2}
                  size="sm"
                  colorScheme="green"
                  onClick={() => grantPermission(
                    user?.id || '',
                    Permission.READ,
                    ResourceType.LOG,
                    'system-logs'
                  )}
                  isDisabled={!isInitialized || !user}
                >
                  Grant Access
                </Button>
              </Box>
            }
          >
            <Box p={4} bg="green.100" borderRadius="md">
              <Text>You have permission to view system logs.</Text>
              <Text fontSize="sm" mt={2}>This content is protected by PermissionGuard.</Text>
              <Button
                mt={2}
                size="sm"
                colorScheme="red"
                onClick={() => revokePermission(
                  user?.id || '',
                  Permission.READ,
                  ResourceType.LOG,
                  'system-logs'
                )}
                isDisabled={!isInitialized || !user}
              >
                Revoke Access
              </Button>
            </Box>
          </PermissionGuard>
        </Box>
      </VStack>
    </Box>
  );
}
