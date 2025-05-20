import { useState } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import {
  Box,
  Flex,
  Heading,
  Button,
  IconButton,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  Spacer,
  Container,
  useColorModeValue,
  Icon,
  useDisclosure
} from '@chakra-ui/react';
import { HamburgerIcon } from '@chakra-ui/icons';
import { FiLogOut, FiGrid, FiUsers, FiHome } from 'react-icons/fi';
import BulkShowUploadUtility from './BulkShowUploadUtility';

export default function Navbar() {
  const { isAuthenticated, logout, user } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const { isOpen: isBulkUploadOpen, onOpen: onBulkUploadOpen, onClose: onBulkUploadClose } = useDisclosure();

  const isActive = (path: string) => {
    return pathname === path || (path === '/artists' && pathname?.startsWith('/artists'));
  };

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  const bg = useColorModeValue('gray.50', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  const textColor = useColorModeValue('gray.800', 'whiteAlpha.900');
  const hoverBg = useColorModeValue('gray.100', 'gray.700');
  const activeBg = useColorModeValue('blue.500', 'blue.300');
  const activeColor = useColorModeValue('white', 'gray.900');

  if (!isAuthenticated) return null;

  return (
    <Box as="header" bg={bg} borderBottomWidth="1px" borderColor={borderColor} position="sticky" top="0" zIndex="sticky">
      <Container maxW="container.xl" px={{ base: 4, md: 6 }}>
        <Flex h={16} alignItems="center">
          <Link href="/" passHref>
            <Heading as="h1" size="md" color="blue.500" _hover={{ color: 'blue.600' }} cursor="pointer">
              Voices Admin
            </Heading>
          </Link>
          <Spacer />

          <Menu>
            <MenuButton
              as={IconButton}
              aria-label="Options"
              icon={<HamburgerIcon />}
              variant="outline"
            />
            <MenuList bg={bg}>
              <MenuItem
                icon={<Icon as={FiHome} />}
                onClick={() => router.push('/dashboard')}
                bg={isActive('/dashboard') ? activeBg : 'transparent'}
                color={isActive('/dashboard') ? activeColor : textColor}
                _hover={{ bg: hoverBg }}
              >
                Dashboard
              </MenuItem>
              <MenuItem
                icon={<Icon as={FiUsers} />}
                onClick={() => router.push('/artists')}
                bg={isActive('/artists') ? activeBg : 'transparent'}
                color={isActive('/artists') ? activeColor : textColor}
                _hover={{ bg: hoverBg }}
              >
                Artists
              </MenuItem>
              <MenuItem
                icon={<Icon as={FiLogOut} />}
                onClick={handleLogout}
                _hover={{ bg: hoverBg, color: 'red.400' }}
              >
                Logout
              </MenuItem>
              <MenuItem
                icon={<Icon as={FiLogOut} />}
                onClick={() => {
                  onBulkUploadOpen();
                }}
              >
                Bulk Show Upload
              </MenuItem>
              
              
              
            </MenuList>
            <BulkShowUploadUtility isOpen={isBulkUploadOpen} onClose={onBulkUploadClose} />
          </Menu>
        </Flex>
      </Container>

    </Box>
  );
} 