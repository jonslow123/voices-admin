'use client';

import { useState } from 'react';
import {
  Box,
  Button,
  FormControl,
  FormLabel,
  Input,
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
  Select,
} from '@chakra-ui/react';
import { DeleteIcon } from '@chakra-ui/icons';
import { Show } from '@/types/artist';

interface BulkShowUploadUtilityProps {
  onUpload: (shows: Show[]) => Promise<void>;
  isLoading?: boolean;
}

export default function BulkShowUploadUtility({ onUpload, isLoading = false }: BulkShowUploadUtilityProps) {
  const [shows, setShows] = useState<Show[]>([]);
  const [title, setTitle] = useState('');
  const [date, setDate] = useState('');
  const [description, setDescription] = useState('');
  const [mixcloudUrl, setMixcloudUrl] = useState('');
  const [soundcloudUrl, setSoundcloudUrl] = useState('');
  const toast = useToast();

  const handleAddShow = () => {
    if (!title || !date) {
      toast({
        title: 'Missing required fields',
        description: 'Title and date are required',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    const newShow: Show = {
      title,
      date: new Date(date).toISOString(),
      description: description || undefined,
      mixcloudUrl: mixcloudUrl || undefined,
      soundcloudUrl: soundcloudUrl || undefined,
    };

    setShows([...shows, newShow]);
    resetForm();
  };

  const handleRemoveShow = (index: number) => {
    setShows(shows.filter((_, i) => i !== index));
  };

  const resetForm = () => {
    setTitle('');
    setDate('');
    setDescription('');
    setMixcloudUrl('');
    setSoundcloudUrl('');
  };

  const handleSubmit = async () => {
    if (shows.length === 0) {
      toast({
        title: 'No shows to upload',
        description: 'Please add at least one show',
        status: 'warning',
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    try {
      await onUpload(shows);
      setShows([]);
      toast({
        title: 'Shows uploaded successfully',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      toast({
        title: 'Error uploading shows',
        description: 'Please try again',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  };

  return (
    <Box p={4} borderWidth="1px" borderRadius="lg">
      <VStack spacing={6} align="stretch">
        <Text fontSize="xl" fontWeight="bold">Bulk Show Upload</Text>
        
        <FormControl>
          <FormLabel>Title</FormLabel>
          <Input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Show title"
          />
        </FormControl>

        <FormControl>
          <FormLabel>Date</FormLabel>
          <Input
            type="datetime-local"
            value={date}
            onChange={(e) => setDate(e.target.value)}
          />
        </FormControl>

        <FormControl>
          <FormLabel>Description</FormLabel>
          <Input
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Show description"
          />
        </FormControl>

        <FormControl>
          <FormLabel>Mixcloud URL</FormLabel>
          <Input
            value={mixcloudUrl}
            onChange={(e) => setMixcloudUrl(e.target.value)}
            placeholder="https://www.mixcloud.com/..."
          />
        </FormControl>

        <FormControl>
          <FormLabel>SoundCloud URL</FormLabel>
          <Input
            value={soundcloudUrl}
            onChange={(e) => setSoundcloudUrl(e.target.value)}
            placeholder="https://soundcloud.com/..."
          />
        </FormControl>

        <Button
          onClick={handleAddShow}
          colorScheme="blue"
          variant="outline"
        >
          Add Show
        </Button>

        {shows.length > 0 && (
          <Box>
            <Text fontSize="lg" fontWeight="bold" mb={4}>Added Shows</Text>
            <Table variant="simple">
              <Thead>
                <Tr>
                  <Th>Title</Th>
                  <Th>Date</Th>
                  <Th>Links</Th>
                  <Th>Actions</Th>
                </Tr>
              </Thead>
              <Tbody>
                {shows.map((show, index) => (
                  <Tr key={index}>
                    <Td>{show.title}</Td>
                    <Td>{new Date(show.date).toLocaleDateString()}</Td>
                    <Td>
                      <HStack spacing={2}>
                        {show.mixcloudUrl && (
                          <Badge colorScheme="purple">Mixcloud</Badge>
                        )}
                        {show.soundcloudUrl && (
                          <Badge colorScheme="orange">SoundCloud</Badge>
                        )}
                      </HStack>
                    </Td>
                    <Td>
                      <IconButton
                        aria-label="Remove show"
                        icon={<DeleteIcon />}
                        size="sm"
                        onClick={() => handleRemoveShow(index)}
                      />
                    </Td>
                  </Tr>
                ))}
              </Tbody>
            </Table>
          </Box>
        )}

        <Button
          onClick={handleSubmit}
          colorScheme="green"
          isLoading={isLoading}
          isDisabled={shows.length === 0}
        >
          Upload Shows
        </Button>
      </VStack>
    </Box>
  );
}
