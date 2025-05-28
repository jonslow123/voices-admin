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
  useDisclosure,
} from '@chakra-ui/react';
import {
  HamburgerIcon,
} from '@chakra-ui/icons';
import { useAuth } from '@/context/AuthContext';
import { useState } from 'react';
import BulkShowUploadUtility from './BulkShowUploadUtility';
import { Show } from '@/types/artist';

export default function Navbar() {
  const { logout } = useAuth();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const pathname = usePathname();
  const [isUploading, setIsUploading] = useState(false);

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  const handleUpload = async (shows: Show[]) => {
    setIsUploading(true);
    try {
      // TODO: Implement the actual upload logic here
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulated delay
      console.log('Uploading shows:', shows);
    } catch (error) {
      console.error('Upload failed:', error);
    } finally {
      setIsUploading(false);
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
              <MenuItem onClick={onOpen}>
                Bulk Show Upload
              </MenuItem>
              <MenuDivider />
              <MenuItem onClick={handleLogout}>Logout</MenuItem>
            </MenuList>
          </Menu>
        </Stack>
      </Flex>

      <BulkShowUploadUtility
        isOpen={isOpen}
        onClose={onClose}
        onUpload={handleUpload}
        isLoading={isUploading}
      />
    </Box>
  );
} 