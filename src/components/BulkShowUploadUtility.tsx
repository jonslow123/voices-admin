'use client';

import { useState, useEffect } from 'react';
import {
  Box,
  Button,
  FormControl,
  FormLabel,
  Select,
  Textarea,
  VStack,
  Text,
  useToast,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Badge,
  IconButton,
  HStack,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  Progress,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
} from '@chakra-ui/react';
import { DeleteIcon } from '@chakra-ui/icons';
import { Artist, Show } from '@/types/artist';
import { getArtists, addShowToArtist, fetchMixcloudShowData, fetchSoundCloudShowData } from '@/lib/api';

interface BulkShowUploadUtilityProps {
  isOpen: boolean;
  onClose: () => void;
  onUpload?: (shows: Show[]) => Promise<void>;
  isLoading?: boolean;
}

interface ParsedShow {
  url: string;
  platform: 'mixcloud' | 'soundcloud';
  status: 'pending' | 'processing' | 'success' | 'error';
  data?: Show;
  error?: string;
}

export default function BulkShowUploadUtility({ isOpen, onClose, onUpload, isLoading = false }: BulkShowUploadUtilityProps) {
  const [artists, setArtists] = useState<Artist[]>([]);
  const [selectedArtistId, setSelectedArtistId] = useState('');
  const [urlsInput, setUrlsInput] = useState('');
  const [parsedShows, setParsedShows] = useState<ParsedShow[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingProgress, setProcessingProgress] = useState(0);
  const toast = useToast();

  // Fetch artists on component mount
  useEffect(() => {
    const fetchArtistsData = async () => {
      try {
        const artistsData = await getArtists();
        setArtists(artistsData);
      } catch (error) {
        console.error('Error fetching artists:', error);
        toast({
          title: 'Error fetching artists',
          description: 'Please refresh and try again',
          status: 'error',
          duration: 3000,
          isClosable: true,
        });
      }
    };

    if (isOpen) {
      fetchArtistsData();
    }
  }, [isOpen, toast]);

  const detectPlatform = (url: string): 'mixcloud' | 'soundcloud' | null => {
    if (url.includes('mixcloud.com')) return 'mixcloud';
    if (url.includes('soundcloud.com')) return 'soundcloud';
    return null;
  };

  const parseUrls = () => {
    const urls = urlsInput.trim().split('\n').filter(url => url.trim() !== '');
    
    if (urls.length === 0) {
      toast({
        title: 'No URLs provided',
        description: 'Please enter at least one URL',
        status: 'warning',
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    const shows: ParsedShow[] = [];
    
    for (const url of urls) {
      const cleanUrl = url.trim();
      const platform = detectPlatform(cleanUrl);
      
      if (platform) {
        shows.push({
          url: cleanUrl,
          platform,
          status: 'pending',
        });
      } else {
        shows.push({
          url: cleanUrl,
          platform: 'soundcloud', // Default fallback
          status: 'error',
          error: 'Invalid URL - must be Mixcloud or SoundCloud',
        });
      }
    }

    setParsedShows(shows);
  };

  const fetchShowData = async (parsedShow: ParsedShow): Promise<Show> => {
    if (parsedShow.platform === 'mixcloud') {
      return await fetchMixcloudShowData(parsedShow.url);
    } else {
      return await fetchSoundCloudShowData(parsedShow.url);
    }
  };

  const processShows = async () => {
    if (!selectedArtistId) {
      toast({
        title: 'No artist selected',
        description: 'Please select an artist',
        status: 'warning',
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    setIsProcessing(true);
    setProcessingProgress(0);

    const updatedShows = [...parsedShows];
    let processedCount = 0;

    for (let i = 0; i < updatedShows.length; i++) {
      const show = updatedShows[i];
      
      if (show.status === 'error') {
        processedCount++;
        setProcessingProgress((processedCount / updatedShows.length) * 100);
        continue;
      }

      try {
        // Update status to processing
        updatedShows[i] = { ...show, status: 'processing' };
        setParsedShows([...updatedShows]);

        // Fetch show data
        const showData = await fetchShowData(show);
        
        // Add show to artist
        await addShowToArtist(selectedArtistId, showData);
        
        // Update status to success
        updatedShows[i] = { 
          ...show, 
          status: 'success', 
          data: showData 
        };
        
      } catch (error) {
        console.error(`Error processing ${show.url}:`, error);
        updatedShows[i] = { 
          ...show, 
          status: 'error', 
          error: error instanceof Error ? error.message : 'Failed to process URL'
        };
      }

      processedCount++;
      setProcessingProgress((processedCount / updatedShows.length) * 100);
      setParsedShows([...updatedShows]);
    }

    setIsProcessing(false);
    
    const successCount = updatedShows.filter(s => s.status === 'success').length;
    const errorCount = updatedShows.filter(s => s.status === 'error').length;
    
    toast({
      title: 'Processing complete',
      description: `${successCount} shows uploaded successfully, ${errorCount} failed`,
      status: successCount > 0 ? 'success' : 'error',
      duration: 5000,
      isClosable: true,
    });
  };

  const removeShow = (index: number) => {
    setParsedShows(parsedShows.filter((_, i) => i !== index));
  };

  const resetForm = () => {
    setSelectedArtistId('');
    setUrlsInput('');
    setParsedShows([]);
    setProcessingProgress(0);
  };

  const handleClose = () => {
    if (!isProcessing) {
      resetForm();
      onClose();
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success': return 'green';
      case 'error': return 'red';
      case 'processing': return 'blue';
      default: return 'gray';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending': return 'Pending';
      case 'processing': return 'Processing';
      case 'success': return 'Success';
      case 'error': return 'Error';
      default: return 'Unknown';
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} size="xl" closeOnOverlayClick={!isProcessing}>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Bulk Show Upload</ModalHeader>
        {!isProcessing && <ModalCloseButton />}
        <ModalBody>
          <VStack spacing={6} align="stretch">
            <FormControl isRequired>
              <FormLabel>Select Artist</FormLabel>
              <Select
                value={selectedArtistId}
                onChange={(e) => setSelectedArtistId(e.target.value)}
                placeholder="Choose an artist..."
                isDisabled={isProcessing}
              >
                {artists.map((artist) => (
                  <option key={artist._id} value={artist._id}>
                    {artist.name}
                  </option>
                ))}
              </Select>
            </FormControl>

            <FormControl isRequired>
              <FormLabel>Show URLs</FormLabel>
              <Textarea
                value={urlsInput}
                onChange={(e) => setUrlsInput(e.target.value)}
                placeholder={`Paste Mixcloud or SoundCloud URLs, one per line:

https://www.mixcloud.com/artist/show-name/
https://soundcloud.com/artist/track-name
https://www.mixcloud.com/artist/another-show/`}
                rows={8}
                isDisabled={isProcessing}
              />
              <Text fontSize="sm" color="gray.500" mt={2}>
                Enter one URL per line. Supports both Mixcloud and SoundCloud URLs.
              </Text>
            </FormControl>

            {urlsInput.trim() && !isProcessing && (
              <Button
                onClick={parseUrls}
                colorScheme="blue"
                variant="outline"
                isDisabled={!urlsInput.trim()}
              >
                Parse URLs
              </Button>
            )}

            {isProcessing && (
              <Box>
                <Text mb={2}>Processing shows... {Math.round(processingProgress)}%</Text>
                <Progress value={processingProgress} colorScheme="blue" />
              </Box>
            )}

            {parsedShows.length > 0 && (
              <Box>
                <Text fontSize="lg" fontWeight="bold" mb={4}>
                  Detected Shows ({parsedShows.length})
                </Text>
                
                {parsedShows.some(s => s.status === 'error') && (
                  <Alert status="warning" mb={4}>
                    <AlertIcon />
                    <Box>
                      <AlertTitle>Some URLs could not be processed!</AlertTitle>
                      <AlertDescription>
                        Invalid URLs will be skipped during upload.
                      </AlertDescription>
                    </Box>
                  </Alert>
                )}

                <Table variant="simple" size="sm">
                  <Thead>
                    <Tr>
                      <Th>URL</Th>
                      <Th>Platform</Th>
                      <Th>Status</Th>
                      <Th>Title</Th>
                      <Th>Actions</Th>
                    </Tr>
                  </Thead>
                  <Tbody>
                    {parsedShows.map((show, index) => (
                      <Tr key={index}>
                        <Td>
                          <Text isTruncated maxW="200px" title={show.url}>
                            {show.url}
                          </Text>
                        </Td>
                        <Td>
                          <Badge colorScheme={show.platform === 'mixcloud' ? 'purple' : 'orange'}>
                            {show.platform === 'mixcloud' ? 'Mixcloud' : 'SoundCloud'}
                          </Badge>
                        </Td>
                        <Td>
                          <Badge colorScheme={getStatusColor(show.status)}>
                            {getStatusText(show.status)}
                          </Badge>
                        </Td>
                        <Td>
                          {show.data?.title ? (
                            <Text isTruncated maxW="150px" title={show.data.title}>
                              {show.data.title}
                            </Text>
                          ) : show.error ? (
                            <Text fontSize="sm" color="red.500" isTruncated maxW="150px" title={show.error}>
                              {show.error}
                            </Text>
                          ) : (
                            <Text color="gray.400">-</Text>
                          )}
                        </Td>
                        <Td>
                          {!isProcessing && (
                            <IconButton
                              aria-label="Remove show"
                              icon={<DeleteIcon />}
                              size="sm"
                              variant="ghost"
                              onClick={() => removeShow(index)}
                            />
                          )}
                        </Td>
                      </Tr>
                    ))}
                  </Tbody>
                </Table>
              </Box>
            )}
          </VStack>
        </ModalBody>

        <ModalFooter>
          <Button 
            variant="ghost" 
            mr={3} 
            onClick={handleClose}
            isDisabled={isProcessing}
          >
            {isProcessing ? 'Processing...' : 'Cancel'}
          </Button>
          <Button
            onClick={processShows}
            colorScheme="green"
            isDisabled={!selectedArtistId || parsedShows.length === 0 || isProcessing}
            isLoading={isProcessing}
          >
            Upload Shows
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
