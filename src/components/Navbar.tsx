'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Box,
  Flex,
  Text,
  IconButton,
  Stack,
  useColorModeValue,
  useBreakpointValue,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  MenuDivider,
} from '@chakra-ui/react';
import {
  HamburgerIcon,
} from '@chakra-ui/icons';
import { useAuth } from '@/context/AuthContext';
import { useState } from 'react';
import BulkShowUploadUtility from './BulkShowUploadUtility';

export default function Navbar() {
  const { logout } = useAuth();
  const [isBulkUploadOpen, setIsBulkUploadOpen] = useState(false);
  const pathname = usePathname();

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  return (
    <Box>
      <Flex
        bg={useColorModeValue('white', 'gray.800')}
        color={useColorModeValue('gray.600', 'white')}
        minH={'60px'}
        py={{ base: 2 }}
        px={{ base: 4 }}
        borderBottom={1}
        borderStyle={'solid'}
        borderColor={useColorModeValue('gray.200', 'gray.900')}
        align={'center'}
      >
        <Flex flex={{ base: 1 }} justify={{ base: 'center', md: 'start' }}>
          <Text
            textAlign={useBreakpointValue({ base: 'center', md: 'left' })}
            fontFamily={'heading'}
            color={useColorModeValue('gray.800', 'white')}
            fontWeight="bold"
          >
            Voices Admin
          </Text>
        </Flex>

        <Stack
          flex={{ base: 1, md: 0 }}
          justify={'flex-end'}
          direction={'row'}
          spacing={6}
        >
          <Menu>
            <MenuButton
              as={IconButton}
              icon={<HamburgerIcon />}
              variant="ghost"
              aria-label="Navigation Menu"
            />
            <MenuList>
              <MenuItem
                as={Link}
                href="/dashboard"
                color={pathname === '/dashboard' ? 'blue.500' : undefined}
              >
                Dashboard
              </MenuItem>
              <MenuItem
                as={Link}
                href="/artists"
                color={pathname === '/artists' ? 'blue.500' : undefined}
              >
                Artists
              </MenuItem>
              <MenuItem onClick={() => setIsBulkUploadOpen(true)}>
                Bulk Show Upload
              </MenuItem>
              <MenuDivider />
              <MenuItem onClick={handleLogout}>Logout</MenuItem>
            </MenuList>
          </Menu>
        </Stack>
      </Flex>

      <BulkShowUploadUtility
        isOpen={isBulkUploadOpen}
        onClose={() => setIsBulkUploadOpen(false)}
      />
    </Box>
  );
} 