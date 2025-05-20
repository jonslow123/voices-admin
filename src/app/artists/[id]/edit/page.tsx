'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { toast } from 'react-toastify';
import Navbar from '@/components/Navbar';
import ArtistForm from '@/components/ArtistForm';
import ShowForm from '@/components/ShowForm';
import { getArtistById, updateArtist, addShowToArtist, updateShow, deleteShow, deleteArtist } from '@/lib/api';
import { Artist, Show } from '@/types/artist';
import { ArrowUturnLeftIcon, PlusIcon } from '@heroicons/react/24/outline';
import Link from 'next/link';
import {
  Box,
  Flex,
  Heading,
  Button,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  Text,
  Container,
  HStack,
  Card,
  CardBody,
  Spinner,
  useColorModeValue,
  IconButton,
  VStack,
  AlertDialog,
  AlertDialogBody,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogContent,
  AlertDialogOverlay,
  Input,
  useDisclosure,
} from '@chakra-ui/react';
import { EditIcon, DeleteIcon } from '@chakra-ui/icons';

export default function EditArtistPage() {
  const params = useParams();
  const id = params?.id ? (Array.isArray(params.id) ? params.id[0] : params.id) : '';
  const [artist, setArtist] = useState<Artist | null>(null);
  const [isFormLoading, setIsFormLoading] = useState(false);
  const [isPageLoading, setIsPageLoading] = useState(true);
  const [isAddingShow, setIsAddingShow] = useState(false);
  const [isEditingShow, setIsEditingShow] = useState<string | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);
  const [deleteConfirmation, setDeleteConfirmation] = useState('');
  const { isOpen, onOpen, onClose } = useDisclosure();
  const cancelRef = useRef<HTMLButtonElement>(null);
  const router = useRouter();

  const cardBg = useColorModeValue('white', 'gray.700');
  const textColorPrimary = useColorModeValue('gray.800', 'whiteAlpha.900');
  const textColorSecondary = useColorModeValue('gray.600', 'whiteAlpha.700');

  useEffect(() => {
    async function fetchArtist() {
      if (!id) {
        toast.error("Invalid artist ID.");
        router.push('/artists');
        return;
      }
      try {
        setIsPageLoading(true);
        const data = await getArtistById(id);
        setArtist(data);
      } catch (error: unknown) {
        console.error('Failed to fetch artist:', error);
        toast.error('Failed to load artist for editing.');
        router.push('/artists');
      } finally {
        setIsPageLoading(false);
      }
    }
    fetchArtist();
  }, [id, router, refreshKey]);

  const handleSubmit = async (data: Partial<Artist>) => {
    try {
      setIsFormLoading(true);
      await updateArtist(id, data);
      toast.success('Artist updated successfully');
      router.push(`/artists/${id}`);
    } catch (error: unknown) {
      console.error('Failed to update artist:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to update artist');
    } finally {
      setIsFormLoading(false);
    }
  };
  
  const handleAddShow = async (data: Partial<Show>) => {
    try {
      setIsFormLoading(true);
      await addShowToArtist(id, data);
      toast.success('Show added successfully');
      setRefreshKey(prevKey => prevKey + 1);
      setIsAddingShow(false);
    } catch (error: unknown) {
      console.error('Failed to add show:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to add show');
    } finally {
      setIsFormLoading(false);
    }
  };

  const handleUpdateShow = async (data: Partial<Show>) => {
    if (!isEditingShow) return;
    try {
      setIsFormLoading(true);
      await updateShow(id, isEditingShow, data);
      toast.success('Show updated successfully');
      setIsEditingShow(null);
      const updatedArtist = await getArtistById(id);
      setArtist(updatedArtist);
    } catch (error: unknown) {
      console.error('Failed to update show:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to update show');
    } finally {
      setIsFormLoading(false);
    }
  };
  
  const handleDeleteShow = async (showId: string) => {
    if (!confirm('Are you sure you want to delete this show?')) return;
    
    try {
      setIsFormLoading(true);
      console.log('Attempting to delete show:', { artistId: id, showId });
      await deleteShow(id, showId);
      toast.success('Show deleted successfully');
      const updatedArtist = await getArtistById(id);
      setArtist(updatedArtist);
    } catch (error: unknown) {
      console.error('Failed to delete show:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to delete show');
    } finally {
      setIsFormLoading(false);
    }
  };

  const handleDeleteArtist = async () => {
    if (deleteConfirmation !== 'DELETE') {
      toast.error('Please type DELETE in capital letters to confirm');
      return;
    }

    try {
      setIsFormLoading(true);
      await deleteArtist(id);
      toast.success('Artist deleted successfully');
      router.push('/artists');
    } catch (error: unknown) {
      console.error('Failed to delete artist:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to delete artist');
    } finally {
      setIsFormLoading(false);
      onClose();
    }
  };

  if (isPageLoading) {
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
              <Text color="red.500" fontSize="lg" mb={4}>Artist not found or failed to load.</Text>
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
              <Link href="/artists" passHref>
                <Text as="a" color="blue.500" _hover={{ textDecoration: 'underline' }}>
                  Artists
                </Text>
              </Link>
              <Text>/</Text>
              <Link href={`/artists/${id}`} passHref>
                <Text as="a" color="blue.500" _hover={{ textDecoration: 'underline' }}>
                  {artist.name}
                </Text>
              </Link>
              <Text>/</Text>
              <Text>Edit</Text>
            </HStack>
            <Flex direction={{ base: 'column', md: 'row' }} justify="space-between" align={{ base: 'flex-start', md: 'center' }} gap={4}>
              <Heading as="h1" size="xl" color={textColorPrimary}>Edit Artist</Heading>
              <Button onClick={() => router.back()} colorScheme="gray" leftIcon={<ArrowUturnLeftIcon className="h-5 w-5" />} variant="outline">
                Back
              </Button>
            </Flex>
          </Box>

          <Card bg={cardBg} shadow="md" borderRadius="lg">
            <CardBody>
              <Tabs colorScheme="blue" variant="enclosed">
                <TabList>
                  <Tab>Artist Info</Tab>
                  <Tab>Shows</Tab>
                  <Tab color="red.500">Delete Artist</Tab>
                </TabList>
                <TabPanels>
                  <TabPanel>
                    <ArtistForm 
                      initialData={artist} 
                      onSubmit={handleSubmit} 
                      isLoading={isFormLoading} 
                    />
                  </TabPanel>
                  <TabPanel>
                    <Box>
                      <Flex justify="space-between" align="center" mb={6}>
                        <Heading as="h2" size="lg" color={textColorPrimary}>Shows</Heading>
                        <Button 
                          colorScheme="blue" 
                          leftIcon={<PlusIcon className="h-4 w-4" />}
                          onClick={() => { setIsAddingShow(true); setIsEditingShow(null); }}
                          isDisabled={isAddingShow}
                        >
                          Add Show
                        </Button>
                      </Flex>
                      
                      {(isAddingShow || isEditingShow) && (
                        <Card variant="outline" mb={6} bg={cardBg}>
                          <CardBody>
                            <Heading as="h3" size="md" mb={4} color={textColorPrimary}>
                              {isAddingShow ? 'Add New Show' : 'Edit Show'}
                            </Heading>
                            <ShowForm 
                              initialData={isEditingShow ? editingShowData : undefined}
                              onSubmit={isAddingShow ? handleAddShow : handleUpdateShow} 
                              isLoading={isFormLoading} 
                              onCancel={() => { setIsAddingShow(false); setIsEditingShow(null); }}
                            />
                          </CardBody>
                        </Card>
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
                                  </HStack>
                                </Flex>
                              </CardBody>
                            </Card>
                          ))}
                        </VStack>
                      ) : (
                        !isAddingShow && (
                          <Text textAlign="center" py={4} color={textColorSecondary}>
                            No shows recorded for this artist yet.
                          </Text>
                        )
                      )}
                    </Box>
                  </TabPanel>
                  <TabPanel>
                    <VStack spacing={6} align="stretch">
                      <Box>
                        <Heading as="h3" size="md" color="red.500" mb={4}>
                          Delete Artist
                        </Heading>
                        <Text color={textColorSecondary} mb={6}>
                          Please be extremely careful when deleting an artist. This action cannot be undone and will permanently remove all associated data, including shows and profile information. Make sure you have backed up any important information before proceeding.
                        </Text>
                        <Button
                          colorScheme="red"
                          variant="solid"
                          onClick={onOpen}
                          leftIcon={<DeleteIcon />}
                        >
                          Delete Artist
                        </Button>
                      </Box>
                    </VStack>
                  </TabPanel>
                </TabPanels>
              </Tabs>
            </CardBody>
          </Card>
        </VStack>
      </Container>

      <AlertDialog
        isOpen={isOpen}
        leastDestructiveRef={cancelRef}
        onClose={onClose}
      >
        <AlertDialogOverlay>
          <AlertDialogContent>
            <AlertDialogHeader fontSize="lg" fontWeight="bold">
              Delete Artist
            </AlertDialogHeader>

            <AlertDialogBody>
              <Text mb={4}>
                Are you absolutely sure you want to delete this artist? This action cannot be undone.
              </Text>
              <Text mb={4}>
                To confirm, please type <Text as="span" fontWeight="bold">DELETE</Text> in capital letters:
              </Text>
              <Input
                value={deleteConfirmation}
                onChange={(e) => setDeleteConfirmation(e.target.value)}
                placeholder="Type DELETE"
                mb={4}
              />
            </AlertDialogBody>

            <AlertDialogFooter>
              <Button ref={cancelRef} onClick={onClose}>
                Cancel
              </Button>
              <Button
                colorScheme="red"
                onClick={handleDeleteArtist}
                ml={3}
                isDisabled={deleteConfirmation !== 'DELETE'}
                isLoading={isFormLoading}
              >
                Delete
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialogOverlay>
      </AlertDialog>
    </>
  );
}