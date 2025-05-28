'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { toast } from 'react-toastify';
import Navbar from '@/components/Navbar';
import { getArtists } from '@/lib/api';
import { Artist } from '@/types/artist';
import {
  Box,
  Button,
  Flex,
  Heading,
  Input,
  InputGroup,
  InputLeftElement,
  Select,
  Spinner,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Image,
  Text,
  Container,
  useColorModeValue,
  SimpleGrid,
  Tag,
  HStack,
  VStack,
  Card,
  CardBody,
  useBreakpointValue,
  IconButton,
} from '@chakra-ui/react';
import { SearchIcon, AddIcon, ViewIcon, EditIcon } from '@chakra-ui/icons';

export default function ArtistsPage() {
  const [artists, setArtists] = useState<Artist[]>([]);
  const [filteredArtists, setFilteredArtists] = useState<Artist[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const cardBg = useColorModeValue('white', 'gray.700');
  const textColorPrimary = useColorModeValue('gray.800', 'whiteAlpha.900');
  const textColorSecondary = useColorModeValue('gray.600', 'whiteAlpha.700');
  const borderColor = useColorModeValue('gray.200', 'gray.600');
  const rowHoverBg = useColorModeValue('gray.50', 'gray.600');
  const isMobile = useBreakpointValue({ base: true, md: false });

  useEffect(() => {
    async function fetchArtists() {
      try {
        setIsLoading(true);
        const data = await getArtists();
        setArtists(data);
        setFilteredArtists(data);
      } catch (error: unknown) {
        console.error('Failed to fetch artists:', error);
        toast.error('Failed to load artists');
      } finally {
        setIsLoading(false);
      }
    }

    fetchArtists();
  }, []);

  useEffect(() => {
    let result = [...artists];
    
    if (searchTerm) {
      result = result.filter(artist => 
        artist.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (artist.bio && artist.bio.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }
    
    if (statusFilter !== 'all') {
      if (statusFilter === 'active') {
        result = result.filter(artist => artist.isActive);
      } else if (statusFilter === 'inactive') {
        result = result.filter(artist => !artist.isActive);
      } else if (statusFilter === 'featured') {
        result = result.filter(artist => artist.featured);
      }
    }
    
    setFilteredArtists(result);
  }, [artists, searchTerm, statusFilter]);

  const renderArtistCard = (artist: Artist) => (
    <Card key={artist._id} bg={cardBg} shadow="md" borderRadius="lg" overflow="hidden">
      <CardBody>
        <Flex direction={{ base: 'column', sm: 'row' }} align="center" gap={4}>
          {artist.imageUrl && (
            <Image
              borderRadius="full"
              boxSize={{ base: '100px', sm: '80px' }}
              src={artist.imageUrl}
              alt={artist.name}
              objectFit="cover"
              borderWidth="2px"
              borderColor={borderColor}
            />
          )}
          <VStack align={{ base: 'center', sm: 'flex-start' }} flex={1} spacing={2}>
            <Text fontWeight="bold" fontSize="lg" color={textColorPrimary}>{artist.name}</Text>
            <Text fontSize="sm" color={textColorSecondary} noOfLines={2}>
              {artist.genres?.slice(0, 3).join(', ')}
              {(artist.genres?.length || 0) > 3 && '...'}
            </Text>
            <HStack spacing={2} wrap="wrap" justify={{ base: 'center', sm: 'flex-start' }}>
              <Tag size="sm" colorScheme={artist.isActive ? 'green' : 'red'} variant="solid">
                {artist.isActive ? 'Active' : 'Inactive'}
              </Tag>
              {artist.featured && (
                <Tag size="sm" colorScheme="orange" variant="solid">Featured</Tag>
              )}
            </HStack>
          </VStack>
          <HStack spacing={2}>
            <Link href={`/artists/${artist._id}`} passHref>
              <IconButton
                as="a"
                aria-label="View artist"
                icon={<ViewIcon />}
                size="sm"
                colorScheme="blue"
                variant="ghost"
              />
            </Link>
            <Link href={`/artists/${artist._id}/edit`} passHref>
              <IconButton
                as="a"
                aria-label="Edit artist"
                icon={<EditIcon />}
                size="sm"
                colorScheme="gray"
                variant="ghost"
              />
            </Link>
          </HStack>
        </Flex>
      </CardBody>
    </Card>
  );

  return (
    <>
      <Navbar />
      <Container maxW="container.xl" py={8}>
        <Flex direction={{ base: 'column', md: 'row' }} justify="space-between" align={{ base: 'flex-start', md: 'center' }} mb={8}>
          <Heading as="h1" size="xl" color={textColorPrimary} mb={{ base: 4, md: 0 }}>
            Artists
          </Heading>
          <Link href="/artists/new" passHref>
            <Button
              as="a"
              colorScheme="blue"
              leftIcon={<AddIcon />}
              size={{ base: 'md', md: 'lg' }}
              width={{ base: 'full', md: 'auto' }}
            >
              Add New Artist
            </Button>
          </Link>
        </Flex>

        <Card bg={cardBg} shadow="md" borderRadius="lg" mb={8}>
          <CardBody>
            <SimpleGrid columns={{ base: 1, md: 3 }} spacing={6}>
              <Box gridColumn={{ base: 'auto', md: 'span 2' }}>
                <Text mb={2} fontWeight="medium" color={textColorSecondary}>Search Artists</Text>
                <InputGroup size="md">
                  <InputLeftElement pointerEvents="none">
                    <SearchIcon color="gray.400" />
                  </InputLeftElement>
                  <Input
                    type="text"
                    placeholder="Search by name or bio..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    variant="filled"
                    _hover={{ borderColor: 'gray.400' }}
                    _focus={{ borderColor: 'blue.500', boxShadow: '0 0 0 1px var(--chakra-colors-blue-500)' }}
                  />
                </InputGroup>
              </Box>
              <Box>
                <Text mb={2} fontWeight="medium" color={textColorSecondary}>Status</Text>
                <Select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  variant="filled"
                  _hover={{ borderColor: 'gray.400' }}
                  _focus={{ borderColor: 'blue.500', boxShadow: '0 0 0 1px var(--chakra-colors-blue-500)' }}
                >
                  <option value="all">All Statuses</option>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                  <option value="featured">Featured</option>
                </Select>
              </Box>
            </SimpleGrid>
          </CardBody>
        </Card>

        {isLoading ? (
          <Flex justify="center" align="center" h="300px">
            <Spinner size="xl" color="blue.500" thickness="4px" />
          </Flex>
        ) : (
          <Box>
            {isMobile ? (
              <VStack spacing={4} align="stretch">
                {filteredArtists.length > 0 ? (
                  filteredArtists.map(renderArtistCard)
                ) : (
                  <Card bg={cardBg} shadow="md" borderRadius="lg">
                    <CardBody>
                      <Text textAlign="center" py={10} color={textColorSecondary}>
                        No artists found matching your criteria.
                      </Text>
                    </CardBody>
                  </Card>
                )}
              </VStack>
            ) : (
              <Box bg={cardBg} borderRadius="lg" shadow="md" overflowX="auto">
                <Table variant="simple" colorScheme="gray">
                  <Thead>
                    <Tr>
                      <Th>Name</Th>
                      <Th>Status</Th>
                      <Th isNumeric>Shows</Th>
                      <Th>Actions</Th>
                    </Tr>
                  </Thead>
                  <Tbody>
                    {filteredArtists.length > 0 ? filteredArtists.map((artist) => (
                      <Tr key={artist._id} _hover={{ bg: rowHoverBg }}>
                        <Td>
                          <Flex align="center">
                            {artist.imageUrl && (
                              <Image
                                borderRadius="full"
                                boxSize="40px"
                                src={artist.imageUrl}
                                alt={artist.name}
                                mr={4}
                                objectFit="cover"
                                borderWidth="2px"
                                borderColor={borderColor}
                              />
                            )}
                            <VStack align="flex-start" spacing={0}>
                              <Text fontWeight="medium" color={textColorPrimary}>{artist.name}</Text>
                              <Text fontSize="sm" color={textColorSecondary}>
                                {artist.genres?.slice(0, 3).join(', ')}
                                {(artist.genres?.length || 0) > 3 && '...'}
                              </Text>
                            </VStack>
                          </Flex>
                        </Td>
                        <Td>
                          <HStack spacing={2} wrap="wrap">
                            <Tag size="sm" colorScheme={artist.isActive ? 'green' : 'red'} variant="solid">
                              {artist.isActive ? 'Active' : 'Inactive'}
                            </Tag>
                            {artist.featured && (
                              <Tag size="sm" colorScheme="orange" variant="solid">Featured</Tag>
                            )}
                          </HStack>
                        </Td>
                        <Td isNumeric color={textColorSecondary}>{artist.shows?.length || 0}</Td>
                        <Td>
                          <HStack spacing={3}>
                            <Link href={`/artists/${artist._id}`} passHref>
                              <IconButton
                                as="a"
                                aria-label="View artist"
                                icon={<ViewIcon />}
                                size="sm"
                                colorScheme="blue"
                                variant="ghost"
                              />
                            </Link>
                            <Link href={`/artists/${artist._id}/edit`} passHref>
                              <IconButton
                                as="a"
                                aria-label="Edit artist"
                                icon={<EditIcon />}
                                size="sm"
                                colorScheme="gray"
                                variant="ghost"
                              />
                            </Link>
                          </HStack>
                        </Td>
                      </Tr>
                    )) : (
                      <Tr>
                        <Td colSpan={4}>
                          <Text textAlign="center" py={10} color={textColorSecondary}>
                            No artists found matching your criteria.
                          </Text>
                        </Td>
                      </Tr>
                    )}
                  </Tbody>
                </Table>
              </Box>
            )}
          </Box>
        )}
      </Container>
    </>
  );
} 