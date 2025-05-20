'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  Box,
  Heading,
  Spinner,
  Text,
  Flex,
  Image,
  Link as ChakraLink,
  SimpleGrid,
  Stat,
  StatLabel,
  StatNumber,
  useColorModeValue,
  Tag,
  Container,
  Icon,
  InputGroup,
  InputLeftElement,
  Input,
  Select,
  HStack
} from '@chakra-ui/react';
import Navbar from '@/components/Navbar';
import { getArtists } from '@/lib/api';
import { Artist } from '@/types/artist';
import { FiUsers, FiBarChart2, FiStar, FiEye } from 'react-icons/fi';
import { SearchIcon } from '@chakra-ui/icons';

export default function DashboardPage() {
  const [artists, setArtists] = useState<Artist[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  // Theme-aware colors
  const cardBg = useColorModeValue('white', 'gray.700'); // Card background
  const textColorPrimary = useColorModeValue('gray.800', 'whiteAlpha.900');
  const textColorSecondary = useColorModeValue('gray.600', 'whiteAlpha.700');
  const statLabelColor = useColorModeValue('gray.500', 'gray.400');
  const statNumberColor = useColorModeValue('gray.700', 'whiteAlpha.900');
  const errorBg = useColorModeValue('red.50', 'red.900');
  const errorBorderColor = useColorModeValue('red.300', 'red.600');
  const errorTextColor = useColorModeValue('red.800', 'red.100');
  const boxBorderColor = useColorModeValue('gray.200', 'gray.600');
  const flexBorderColor = useColorModeValue('gray.100', 'gray.600');

  useEffect(() => {
    const fetchArtists = async () => {
      try {
        setIsLoading(true);
        const data = await getArtists();
        setArtists(data);
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : 'Failed to fetch artists');
        setArtists([]);
      } finally {
        setIsLoading(false);
      }
    };
    fetchArtists();
  }, []);

  const totalArtists = artists.length;
  const totalShows = artists.reduce((acc, artist) => acc + (artist.shows?.length || 0), 0);
  const totalResidents = artists.filter(artist => artist.isResident).length;
  const totalFeatured = artists.filter(artist => artist.featured).length;

  interface StatCardProps {
    title: string;
    stat: string | number;
    icon: React.ReactElement;
    // helpText?: string;
    // helpTextType?: 'increase' | 'decrease';
  }

  const StatCard = ({ title, stat, icon }: StatCardProps) => (
    <Stat
      px={{ base: 4, md: 6 }}
      py={'5'}
      shadow={'xl'}
      border={'1px solid'}
      borderColor={useColorModeValue('gray.200', 'gray.600')}
      rounded={'lg'}
      bg={cardBg}
    >
      <Flex justifyContent={'space-between'}>
        <Box pl={{ base: 2, md: 4 }}>
          <StatLabel fontWeight={'medium'} isTruncated color={statLabelColor}>
            {title}
          </StatLabel>
          <StatNumber fontSize={'2xl'} fontWeight={'medium'} color={statNumberColor}>
            {stat}
          </StatNumber>
        </Box>
        <Box
          my={'auto'}
          color={useColorModeValue('gray.600', 'gray.200')}
          alignContent={'center'}>
          {icon}
        </Box>
      </Flex>
    </Stat>
  );

  return (
    <>
      <Navbar />
      <Container maxW="container.xl" py={8}>
        <Heading as="h1" size="xl" mb={8} color={textColorPrimary}>
          Dashboard
        </Heading>
  
        {isLoading ? (
          <Flex justify="center" align="center" minH="300px">
            <Spinner size="xl" color="blue.500" thickness="4px"/>
          </Flex>
        ) : (
          <>
            {error && (
              <Box bg={errorBg} borderWidth="1px" borderColor={errorBorderColor} color={errorTextColor} p={4} mb={6} borderRadius="md">
                <Text fontWeight="bold">API Error:</Text>
                <Text>{error}</Text>
                <Text>Displaying available dashboard content.</Text>
              </Box>
            )}
  
            <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} spacing={{ base: 5, lg: 8 }} mb={8}>
              <StatCard title={'Total Artists'} stat={totalArtists} icon={<Icon as={FiUsers} w={10} h={10} />} />
              <StatCard title={'Total Shows'} stat={totalShows} icon={<Icon as={FiBarChart2} w={10} h={10} />} />
              <StatCard title={'Resident Artists'} stat={totalResidents} icon={<Icon as={FiStar} w={10} h={10} />} />
              <StatCard title={'Featured Artists'} stat={totalFeatured} icon={<Icon as={FiEye} w={10} h={10} />} />
            </SimpleGrid>
  
            <Box bg={cardBg} p={6} borderRadius="lg" shadow="md" mb={8}>
              <SimpleGrid columns={{ base: 1, md: 3 }} spacing={6}>
                <Box gridColumn={{ base: 'auto', md: 'span 2' }}>
                  <Text mb={2} fontWeight="medium" color={textColorSecondary}>Search</Text>
                  <InputGroup size="md">
                    <InputLeftElement pointerEvents="none">
                      <SearchIcon color="gray.400" />
                    </InputLeftElement>
                    <Input
                      type="text"
                      placeholder="Search by name or title..."
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
                    <option value="all">All</option>
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                    <option value="featured">Featured</option>
                  </Select>
                </Box>
              </SimpleGrid>
            </Box>
  
            <Box bg={cardBg} p={6} borderRadius="lg" shadow="xl" borderWidth="1px" borderColor={boxBorderColor}>
              <Heading as="h2" size="lg" mb={6} color={textColorPrimary}>
                Recent Artists
              </Heading>
  
              {artists.length === 0 && !error ? ( // Show only if no artists and no error
                <Text textAlign="center" py={10} color={textColorSecondary}>No artists found.</Text>
              ) : (
                // Only map if artists array is not empty
                artists.length > 0 && artists.slice(0, 5).map((artist) => (
                  <Flex key={artist._id} align="center" justify="space-between" mb={4} pb={4} 
                        borderBottomWidth="1px" borderColor={flexBorderColor} 
                        _last={{ borderBottomWidth: 0, mb:0, pb:0 }}>
                    <Flex align="center" flex="1" minW="200px">
                      {artist.imageUrl && (
                        <Image src={artist.imageUrl} alt={artist.name} boxSize="40px" borderRadius="full" mr={4} objectFit="cover" />
                      )}
                      <Text fontWeight="medium" color={textColorPrimary}>{artist.name}</Text>
                    </Flex>
                    <HStack spacing={2} minW="200px" justify="flex-start" display={{base: 'none', md: 'flex'}}>
                      <Tag size="sm" colorScheme={artist.isActive ? 'green' : 'red'} variant="solid">
                        {artist.isActive ? 'Active' : 'Inactive'}
                      </Tag>
                      {artist.isResident && <Tag size="sm" colorScheme="purple" variant="solid">Resident</Tag>}
                      {artist.featured && <Tag size="sm" colorScheme="orange" variant="solid">Featured</Tag>}
                    </HStack>
                    <Flex gap={3} justify="flex-start" minW="100px">
                      <ChakraLink as={Link} href={`/artists/${artist._id}`} color="blue.400" _hover={{color: "blue.500"}} fontWeight="medium">
                        View
                      </ChakraLink>
                      <ChakraLink as={Link} href={`/artists/${artist._id}/edit`} color={textColorSecondary} _hover={{color: textColorPrimary}} fontWeight="medium">
                        Edit
                      </ChakraLink>
                    </Flex>
                  </Flex>
                ))
              )}
            </Box>
          </>
        )}
      </Container>
    </>
  );
} 