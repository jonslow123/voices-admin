'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { toast } from 'react-toastify';
import Navbar from '@/components/Navbar';
import ShowForm from '@/components/ShowForm';
import { getArtistById, addShowToArtist, updateShow, deleteShow } from '@/lib/api';
import { Artist, Show } from '@/types/artist';
import {
  Box,
  Button,
  Container,
  Flex,
  Heading,
  Text,
  Image,
  VStack,
  HStack,
  Tag,
  Card,
  CardBody,
  Spinner,
  useColorModeValue,
  IconButton,
  Link as ChakraLink,
} from '@chakra-ui/react';
import { ViewIcon, EditIcon, DeleteIcon, ExternalLinkIcon } from '@chakra-ui/icons';

export default function ArtistDetailPage() {
  const params = useParams();
  const id = params?.id ? (Array.isArray(params.id) ? params.id[0] : params.id) : '';
  const [artist, setArtist] = useState<Artist | null>(null);
  const [isFetching, setIsFetching] = useState(true);
  const [isAddingShow, setIsAddingShow] = useState(false);
  const [isEditingShow, setIsEditingShow] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const cardBg = useColorModeValue('white', 'gray.700');
  const textColorPrimary = useColorModeValue('gray.800', 'whiteAlpha.900');
  const textColorSecondary = useColorModeValue('gray.600', 'whiteAlpha.700');
  const borderColor = useColorModeValue('gray.200', 'gray.600');

  useEffect(() => {
    const fetchArtist = async () => {
      if (!id) {
        setError('Artist ID is missing.');
        setIsFetching(false);
        toast.error('Cannot load artist details.');
        router.push('/artists');
        return;
      }
      try {
        setIsFetching(true);
        const data = await getArtistById(id);
        setArtist(data);
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : 'Failed to fetch artist');
        toast.error('Failed to load artist details');
        router.push('/artists');
      } finally {
        setIsFetching(false);
      }
    };
    fetchArtist();
  }, [id, router]);

  const handleAddShow = async (data: Partial<Show>) => {
    try {
      setIsLoading(true);
      await addShowToArtist(id, data);
      toast.success('Show added successfully');
      setIsAddingShow(false);
      const updatedArtist = await getArtistById(id);
      setArtist(updatedArtist);
    } catch (error: unknown) {
      console.error('Failed to add show:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to add show');
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateShow = async (data: Partial<Show>) => {
    if (!isEditingShow) return;
    try {
      setIsLoading(true);
      await updateShow(id, isEditingShow, data);
      toast.success('Show updated successfully');
      setIsEditingShow(null);
      const updatedArtist = await getArtistById(id);
      setArtist(updatedArtist);
    } catch (error: unknown) {
      console.error('Failed to update show:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to update show');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteShow = async (showId: string) => {
    if (!confirm('Are you sure you want to delete this show?')) return;
    
    try {
      setIsLoading(true);
      await deleteShow(id, showId);
      toast.success('Show deleted successfully');
      const updatedArtist = await getArtistById(id);
      setArtist(updatedArtist);
    } catch (error: unknown) {
      console.error('Failed to delete show:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to delete show');
    } finally {
      setIsLoading(false);
    }
  };

  if (isFetching) {
    return (
      <>
        <Navbar />
        <Container maxW="container.xl" py={8}>
          <Flex justify="center" align="center" h="300px">
            <Spinner size="xl" color="blue.500" thickness="4px" />
          </Flex>
        </Container>
      </>
    );
  }

  if (!artist) {
    return (
      <>
        <Navbar />
        <Container maxW="container.xl" py={8}>
          <Card bg={cardBg} shadow="md" borderRadius="lg">
            <CardBody textAlign="center">
              <Text color="red.500" fontSize="lg" mb={4}>{error || 'Artist not found.'}</Text>
              <Link href="/artists" passHref>
                <Button as="a" colorScheme="blue">
                  Back to Artists
                </Button>
              </Link>
            </CardBody>
          </Card>
        </Container>
      </>
    );
  }

  const editingShowData = artist.shows.find(show => show._id === isEditingShow);

  return (
    <>
      <Navbar />
      <Container maxW="container.xl" py={8}>
        <VStack spacing={8} align="stretch">
          <Box>
            <HStack spacing={2} mb={4} fontSize="sm" color={textColorSecondary}>
              <ChakraLink as={Link} href="/artists" color="blue.500" _hover={{ textDecoration: 'underline' }}>
                Artists
              </ChakraLink>
              <Text>/</Text>
              <Text>{artist.name}</Text>
            </HStack>
            <Flex direction={{ base: 'column', md: 'row' }} justify="space-between" align={{ base: 'flex-start', md: 'center' }} gap={4}>
              <Heading as="h1" size="xl" color={textColorPrimary}>{artist.name}</Heading>
              <Link href={`/artists/${id}/edit`} passHref>
                <Button as="a" leftIcon={<EditIcon />} colorScheme="blue" variant="outline">
                  Edit Artist
                </Button>
              </Link>
            </Flex>
          </Box>

          <Flex direction={{ base: 'column', lg: 'row' }} gap={8}>
            <Box flex="2">
              <VStack spacing={8} align="stretch">
                <Card bg={cardBg} shadow="md" borderRadius="lg">
                  <CardBody>
                    <Heading as="h2" size="lg" mb={6} color={textColorPrimary}>Artist Information</Heading>
                    <Flex direction={{ base: 'column', sm: 'row' }} gap={6}>
                      {artist.imageUrl && (
                        <Box flexShrink={0} w={{ base: 'full', sm: '160px' }} h={{ base: '160px', sm: '160px' }}>
                          <Image
                            src={artist.imageUrl}
                            alt={artist.name}
                            w="full"
                            h="full"
                            objectFit="cover"
                            borderRadius="lg"
                            borderWidth="2px"
                            borderColor={borderColor}
                          />
                        </Box>
                      )}
                      <VStack align="stretch" spacing={4} flex={1}>
                        <Box>
                          <Text fontWeight="medium" mb={2} color={textColorSecondary}>Bio</Text>
                          <Text color={textColorPrimary}>
                            {artist.bio || <Text as="i" color={textColorSecondary}>No bio available.</Text>}
                          </Text>
                        </Box>
                        <Box>
                          <Text fontWeight="medium" mb={2} color={textColorSecondary}>Status</Text>
                          <HStack spacing={2} wrap="wrap">
                            <Tag size="md" colorScheme={artist.isActive ? 'green' : 'red'} variant="solid">
                              {artist.isActive ? 'Active' : 'Inactive'}
                            </Tag>
                            {artist.isResident && (
                              <Tag size="md" colorScheme="purple" variant="solid">Resident</Tag>
                            )}
                            {artist.featured && (
                              <Tag size="md" colorScheme="orange" variant="solid">Featured</Tag>
                            )}
                          </HStack>
                        </Box>
                        <Box>
                          <Text fontWeight="medium" mb={2} color={textColorSecondary}>Genres</Text>
                          <HStack spacing={2} wrap="wrap">
                            {artist.genres?.length > 0 ? (
                              artist.genres.map((genre, index) => (
                                <Tag key={index} size="md" variant="outline" colorScheme="gray">
                                  {genre}
                                </Tag>
                              ))
                            ) : (
                              <Text color={textColorSecondary} fontSize="sm" fontStyle="italic">
                                No genres specified.
                              </Text>
                            )}
                          </HStack>
                        </Box>
                      </VStack>
                    </Flex>
                  </CardBody>
                </Card>

                <Card bg={cardBg} shadow="md" borderRadius="lg">
                  <CardBody>
                    <Flex justify="space-between" align="center" mb={6}>
                      <Heading as="h2" size="lg" color={textColorPrimary}>Shows</Heading>
                      <Button
                        colorScheme="blue"
                        leftIcon={<ViewIcon />}
                        onClick={() => { setIsAddingShow(true); setIsEditingShow(null); }}
                        isDisabled={isAddingShow}
                      >
                        Add Show
                      </Button>
                    </Flex>

                    {(isAddingShow || isEditingShow) && (
                      <Box mb={6} pt={6} borderTopWidth={1} borderColor={borderColor}>
                        <Heading as="h3" size="md" mb={4} color={textColorPrimary}>
                          {isAddingShow ? 'Add New Show' : 'Edit Show'}
                        </Heading>
                        <ShowForm
                          initialData={isEditingShow ? editingShowData : undefined}
                          onSubmit={isAddingShow ? handleAddShow : handleUpdateShow}
                          isLoading={isLoading}
                          onCancel={() => { setIsAddingShow(false); setIsEditingShow(null); }}
                        />
                      </Box>
                    )}

                    {artist.shows?.length > 0 ? (
                      <VStack spacing={4} align="stretch">
                        {artist.shows.map((show) => (
                          <Card key={show._id} variant="outline" bg={cardBg} _hover={{ shadow: 'md' }} transition="all 0.2s">
                            <CardBody>
                              <Flex direction={{ base: 'column', sm: 'row' }} justify="space-between" align={{ base: 'flex-start', sm: 'center' }} gap={4}>
                                <Box>
                                  <Text fontWeight="bold" color={textColorPrimary}>{show.title}</Text>
                                  <Text fontSize="sm" color={textColorSecondary}>
                                    {new Date(show.date).toLocaleDateString()}
                                    {show.duration && ` • ${Math.floor(show.duration / 60)}:${(show.duration % 60).toString().padStart(2, '0')}`}
                                  </Text>
                                </Box>
                                <HStack spacing={2}>
                                  <IconButton
                                    aria-label="Edit show"
                                    icon={<EditIcon />}
                                    size="sm"
                                    onClick={() => { setIsEditingShow(show._id || ''); setIsAddingShow(false); }}
                                  />
                                  <IconButton
                                    aria-label="Delete show"
                                    icon={<DeleteIcon />}
                                    size="sm"
                                    colorScheme="red"
                                    variant="ghost"
                                    onClick={() => handleDeleteShow(show._id || '')}
                                  />
                                  {show.mixcloudUrl && (
                                    <IconButton
                                      as="a"
                                      href={show.mixcloudUrl}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      aria-label="View on Mixcloud"
                                      icon={<ExternalLinkIcon />}
                                      size="sm"
                                      colorScheme="blue"
                                      variant="ghost"
                                    />
                                  )}
                                  {show.soundcloudUrl && (
                                    <IconButton
                                      as="a"
                                      href={show.soundcloudUrl}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      aria-label="View on Soundcloud"
                                      icon={<ExternalLinkIcon />}
                                      size="sm"
                                      colorScheme="orange"
                                      variant="ghost"
                                    />
                                  )}
                                </HStack>
                              </Flex>
                            </CardBody>
                          </Card>
                        ))}
                      </VStack>
                    ) : (
                      !isAddingShow && !isEditingShow && (
                        <Text textAlign="center" py={4} color={textColorSecondary}>
                          No shows recorded for this artist yet.
                        </Text>
                      )
                    )}
                  </CardBody>
                </Card>
              </VStack>
            </Box>

            <Box flex="1">
              <Card bg={cardBg} shadow="md" borderRadius="lg" position={{ lg: 'sticky' }} top={24}>
                <CardBody>
                  <Heading as="h2" size="lg" mb={6} color={textColorPrimary}>Profile Links</Heading>
                  {(artist.mixcloudUsername || artist.soundcloudUsername || Object.values(artist.socialLinks || {}).some(link => link)) ? (
                    <VStack spacing={3} align="stretch">
                      {artist.mixcloudUsername && (
                        <ChakraLink
                          href={`https://www.mixcloud.com/${artist.mixcloudUsername}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          color={textColorSecondary}
                          _hover={{ color: 'blue.500' }}
                          display="flex"
                          alignItems="center"
                        >
                          <Text w="24">Mixcloud:</Text>
                          <Text color="blue.500" _hover={{ textDecoration: 'underline' }} isTruncated>
                            {artist.mixcloudUsername}
                          </Text>
                        </ChakraLink>
                      )}
                      {artist.soundcloudUsername && (
                        <ChakraLink
                          href={`https://soundcloud.com/${artist.soundcloudUsername}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          color={textColorSecondary}
                          _hover={{ color: 'blue.500' }}
                          display="flex"
                          alignItems="center"
                        >
                          <Text w="24">Soundcloud:</Text>
                          <Text color="blue.500" _hover={{ textDecoration: 'underline' }} isTruncated>
                            {artist.soundcloudUsername}
                          </Text>
                        </ChakraLink>
                      )}
                      {artist.socialLinks?.instagram && (
                        <ChakraLink
                          href={artist.socialLinks.instagram}
                          target="_blank"
                          rel="noopener noreferrer"
                          color={textColorSecondary}
                          _hover={{ color: 'blue.500' }}
                          display="flex"
                          alignItems="center"
                        >
                          <Text w="24">Instagram:</Text>
                          <Text color="blue.500" _hover={{ textDecoration: 'underline' }} isTruncated>
                            {artist.socialLinks.instagram}
                          </Text>
                        </ChakraLink>
                      )}
                      {artist.socialLinks?.facebook && (
                        <ChakraLink
                          href={artist.socialLinks.facebook}
                          target="_blank"
                          rel="noopener noreferrer"
                          color={textColorSecondary}
                          _hover={{ color: 'blue.500' }}
                          display="flex"
                          alignItems="center"
                        >
                          <Text w="24">Facebook:</Text>
                          <Text color="blue.500" _hover={{ textDecoration: 'underline' }} isTruncated>
                            {artist.socialLinks.facebook}
                          </Text>
                        </ChakraLink>
                      )}
                      {artist.socialLinks?.twitter && (
                        <ChakraLink
                          href={artist.socialLinks.twitter}
                          target="_blank"
                          rel="noopener noreferrer"
                          color={textColorSecondary}
                          _hover={{ color: 'blue.500' }}
                          display="flex"
                          alignItems="center"
                        >
                          <Text w="24">Twitter:</Text>
                          <Text color="blue.500" _hover={{ textDecoration: 'underline' }} isTruncated>
                            {artist.socialLinks.twitter}
                          </Text>
                        </ChakraLink>
                      )}
                      {artist.socialLinks?.website && (
                        <ChakraLink
                          href={artist.socialLinks.website}
                          target="_blank"
                          rel="noopener noreferrer"
                          color={textColorSecondary}
                          _hover={{ color: 'blue.500' }}
                          display="flex"
                          alignItems="center"
                        >
                          <Text w="24">Website:</Text>
                          <Text color="blue.500" _hover={{ textDecoration: 'underline' }} isTruncated>
                            {artist.socialLinks.website}
                          </Text>
                        </ChakraLink>
                      )}
                    </VStack>
                  ) : (
                    <Text color={textColorSecondary} fontStyle="italic">
                      No profile links available.
                    </Text>
                  )}
                </CardBody>
              </Card>
            </Box>
          </Flex>
        </VStack>
      </Container>
    </>
  );
} 