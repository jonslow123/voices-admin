'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'react-toastify';
import Navbar from '@/components/Navbar';
import ArtistForm from '@/components/ArtistForm';
import { createArtist } from '@/lib/api';
import { Artist } from '@/types/artist';
import { ArrowUturnLeftIcon } from '@heroicons/react/24/outline';
import Link from 'next/link';
import {
  Box,
  Button,
  Flex,
  Heading,
  Text,
  Container,
  HStack,
  Card,
  CardBody,
  useColorModeValue,
  VStack,
} from '@chakra-ui/react';

export default function NewArtistPage() {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const cardBg = useColorModeValue('white', 'gray.700');
  const textColorPrimary = useColorModeValue('gray.800', 'whiteAlpha.900');
  const textColorSecondary = useColorModeValue('gray.600', 'whiteAlpha.700');

  const handleSubmit = async (data: Partial<Artist>) => {
    try {
      setIsLoading(true);
      await createArtist(data);
      toast.success('Artist created successfully');
      router.push('/artists');
    } catch (error: unknown) {
      console.error('Failed to create artist:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to create artist');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Navbar />
      <Container maxW="container.xl" py={8}>
        <VStack spacing={8} align="stretch">
          <Box>
            <HStack spacing={2} mb={4} fontSize="sm" color={textColorSecondary}>
              <Link href="/artists" passHref>
                <Text as="a" color="blue.500" _hover={{ textDecoration: 'underline' }}>
                  Artists
                </Text>
              </Link>
              <Text>/</Text>
              <Text>Create New</Text>
            </HStack>
            <Flex direction={{ base: 'column', md: 'row' }} justify="space-between" align={{ base: 'flex-start', md: 'center' }} gap={4}>
              <Heading as="h1" size="xl" color={textColorPrimary}>Create New Artist</Heading>
              <Button onClick={() => router.back()} colorScheme="gray" leftIcon={<ArrowUturnLeftIcon className="h-5 w-5" />} variant="outline">
                Back
              </Button>
            </Flex>
          </Box>

          <Card bg={cardBg} shadow="md" borderRadius="lg">
            <CardBody>
              <ArtistForm onSubmit={handleSubmit} isLoading={isLoading} />
            </CardBody>
          </Card>
        </VStack>
      </Container>
    </>
  );
} 