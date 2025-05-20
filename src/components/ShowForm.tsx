import { useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { Show } from '@/types/artist';
import { fetchMixcloudShowData, fetchSoundCloudShowData } from '@/lib/api';
import {
  Box,
  Button as ChakraButton,
  FormControl,
  FormErrorMessage,
  FormLabel,
  Grid,
  Heading,
  Input,
  Textarea,
  Flex,
  Spinner,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  NumberIncrementStepper,
  NumberDecrementStepper,
  useToast
} from '@chakra-ui/react';

interface ShowFormProps {
  initialData?: Partial<Show>;
  onSubmit: (data: Partial<Show>) => void;
  isLoading: boolean;
  onCancel: () => void;
}

export default function ShowForm({ initialData, onSubmit, isLoading, onCancel }: ShowFormProps) {
  const [isFetching, setIsFetching] = useState(false);
  const [activeSource, setActiveSource] = useState<'mixcloud' | 'soundcloud' | null>(
    initialData?.mixcloudUrl ? 'mixcloud' : initialData?.soundcloudUrl ? 'soundcloud' : null
  );
  const toast = useToast();
  
  const { register, handleSubmit, control, formState: { errors }, setValue, watch, reset } = useForm<Partial<Show>>({
    defaultValues: {
      title: initialData?.title || '',
      description: initialData?.description || '',
      date: initialData?.date ? new Date(initialData.date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
      duration: initialData?.duration || 60,
      mixcloudUrl: initialData?.mixcloudUrl || '',
      soundcloudUrl: initialData?.soundcloudUrl || '',
      imageUrl: initialData?.imageUrl || '',
      mixcloudKey: initialData?.mixcloudKey || '',
      soundcloudId: initialData?.soundcloudId || ''
    }
  });

  const mixcloudUrl = watch('mixcloudUrl');
  const soundcloudUrl = watch('soundcloudUrl');

  const fetchShowDetails = async (source: 'mixcloud' | 'soundcloud') => {
    // Get the current URL values directly from the inputs
    const currentMixcloudUrl = source === 'mixcloud' ? mixcloudUrl : '';
    const currentSoundcloudUrl = source === 'soundcloud' ? soundcloudUrl : '';
    
    if (!currentMixcloudUrl && !currentSoundcloudUrl) {
      toast({
        title: "URL Required",
        description: "Please enter a URL",
        status: "warning",
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    try {
      setIsFetching(true);
      
      // Set the active source
      setActiveSource(source);
      
      // Clear the form entirely
      reset({
        title: '',
        description: '',
        date: new Date().toISOString().split('T')[0],
        duration: 60,
        mixcloudUrl: currentMixcloudUrl,
        soundcloudUrl: currentSoundcloudUrl,
        imageUrl: '',
        mixcloudKey: '',
        soundcloudId: ''
      });
      
      if (source === 'mixcloud' && currentMixcloudUrl) {
        const showData = await fetchMixcloudShowData(currentMixcloudUrl);
        
        // Apply the fetched data directly
        setValue('title', showData.title || '');
        setValue('description', showData.description || '');
        setValue('date', showData.date || new Date().toISOString().split('T')[0]);
        setValue('duration', showData.duration || 60);
        setValue('imageUrl', showData.imageUrl || '');
        setValue('mixcloudKey', showData.mixcloudKey || '');
        
        toast({
          title: "Show data loaded",
          description: "Successfully loaded show details from Mixcloud",
          status: "success",
          duration: 3000,
          isClosable: true,
        });
      } else if (source === 'soundcloud' && currentSoundcloudUrl) {
        const showData = await fetchSoundCloudShowData(currentSoundcloudUrl);
        
        // Apply the fetched data directly
        setValue('title', showData.title || '');
        setValue('description', showData.description || '');
        setValue('date', showData.date || new Date().toISOString().split('T')[0]);
        setValue('duration', showData.duration || 60);
        setValue('imageUrl', showData.imageUrl || '');
        setValue('soundcloudId', showData.soundcloudId || '');
        
        toast({
          title: "Show data loaded",
          description: "Successfully loaded show details from SoundCloud",
          status: "success",
          duration: 3000,
          isClosable: true,
        });
      }
    } catch (error) {
      console.error('Error fetching show details:', error);
      toast({
        title: "Error",
        description: "Failed to fetch show details. Please fill in the fields manually.",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsFetching(false);
    }
  };

  return (
    <Box as="form" onSubmit={handleSubmit(onSubmit)} width="100%">
      <Box borderWidth="1px" borderRadius="lg" p={6} mb={6} boxShadow="md">
        <Heading as="h2" size="lg" mb={6} fontWeight="semibold">
          Show URL
        </Heading>
        
        <Grid templateColumns={{ base: "1fr", md: "repeat(2, 1fr)" }} gap={6}>
          <FormControl isInvalid={!!errors.mixcloudUrl}>
            <FormLabel htmlFor="mixcloudUrl">Mixcloud URL</FormLabel>
            <Flex>
              <Input
                id="mixcloudUrl"
                {...register('mixcloudUrl')}
                placeholder="https://www.mixcloud.com/..."
                mr={2}
              />
              <ChakraButton
                onClick={() => fetchShowDetails('mixcloud')}
                isLoading={isFetching}
                loadingText="Fetching"
                colorScheme="blue"
              >
                Fetch
              </ChakraButton>
            </Flex>
          </FormControl>
          
          <FormControl isInvalid={!!errors.soundcloudUrl}>
            <FormLabel htmlFor="soundcloudUrl">Soundcloud URL</FormLabel>
            <Flex>
              <Input
                id="soundcloudUrl"
                {...register('soundcloudUrl')}
                placeholder="https://soundcloud.com/..."
                mr={2}
              />
              <ChakraButton
                onClick={() => fetchShowDetails('soundcloud')}
                isLoading={isFetching}
                loadingText="Fetching"
                colorScheme="orange"
              >
                Fetch
              </ChakraButton>
            </Flex>
          </FormControl>
        </Grid>
      </Box>
      
      <Box borderWidth="1px" borderRadius="lg" p={6} mb={6} boxShadow="md">
        <Heading as="h2" size="lg" mb={6} fontWeight="semibold">
          Show Information
        </Heading>
        
        <Grid templateColumns={{ base: "1fr", md: "repeat(2, 1fr)" }} gap={6}>
          <FormControl isInvalid={!!errors.title} isRequired>
            <FormLabel htmlFor="title">Title</FormLabel>
            <Input
              id="title"
              {...register('title', { required: 'Title is required' })}
              placeholder="Show Title"
            />
            {errors.title && (
              <FormErrorMessage>{errors.title.message}</FormErrorMessage>
            )}
          </FormControl>
          
          <FormControl isInvalid={!!errors.date} isRequired>
            <FormLabel htmlFor="date">Date</FormLabel>
            <Input
              type="date"
              id="date"
              {...register('date', { 
                required: 'Date is required',
                valueAsDate: true
              })}
            />
            {errors.date && (
              <FormErrorMessage>{errors.date.message}</FormErrorMessage>
            )}
          </FormControl>
          
          <FormControl isInvalid={!!errors.duration}>
            <FormLabel htmlFor="duration">Duration (minutes)</FormLabel>
            <Controller
              name="duration"
              control={control}
              rules={{ min: { value: 1, message: "Duration must be at least 1 minute" } }}
              defaultValue={initialData?.duration || 60}
              render={({ field }) => (
                <NumberInput 
                  {...field} 
                  min={1} 
                  onChange={(valueString) => setValue('duration', parseInt(valueString, 10))}
                >
                  <NumberInputField id="duration" />
                  <NumberInputStepper>
                    <NumberIncrementStepper />
                    <NumberDecrementStepper />
                  </NumberInputStepper>
                </NumberInput>
              )}
            />
            {errors.duration && (
              <FormErrorMessage>{errors.duration.message}</FormErrorMessage>
            )}
          </FormControl>
          
          <FormControl isInvalid={!!errors.imageUrl}>
            <FormLabel htmlFor="imageUrl">Image URL</FormLabel>
            <Input
              id="imageUrl"
              {...register('imageUrl')}
              placeholder="https://example.com/show-image.jpg"
            />
            {errors.imageUrl && (
                <FormErrorMessage>{errors.imageUrl.message}</FormErrorMessage>
            )}
          </FormControl>
          
          <Box gridColumn={{ base: "1 / -1", md: "span 2" }}>
            <FormControl isInvalid={!!errors.description}>
              <FormLabel htmlFor="description">Description</FormLabel>
              <Textarea
                id="description"
                rows={4}
                {...register('description')}
                placeholder="Brief description of the show..."
              />
              {errors.description && (
                <FormErrorMessage>{errors.description.message}</FormErrorMessage>
              )}
            </FormControl>
          </Box>
        </Grid>
      </Box>
      
      <Box borderWidth="1px" borderRadius="lg" p={6} mb={6} boxShadow="md">
        <Heading as="h2" size="lg" mb={6} fontWeight="semibold">
          Streaming Links
        </Heading>
        <Grid templateColumns={{ base: "1fr", md: "repeat(2, 1fr)" }} gap={6}>
          <FormControl 
            isInvalid={!!errors.mixcloudKey} 
            isDisabled={activeSource === 'soundcloud'}
          >
            <FormLabel 
              htmlFor="mixcloudKey" 
              color={activeSource === 'soundcloud' ? 'gray.400' : undefined}
            >
              Mixcloud Key {activeSource === 'soundcloud' && '(Disabled)'}
            </FormLabel>
            <Input
              id="mixcloudKey"
              {...register('mixcloudKey')}
              placeholder="e.g., /artistname/showname/"
              opacity={activeSource === 'soundcloud' ? 0.5 : 1}
              _disabled={{ cursor: 'not-allowed', opacity: 0.5 }}
            />
            {errors.mixcloudKey && (
                <FormErrorMessage>{errors.mixcloudKey.message}</FormErrorMessage>
            )}
          </FormControl>
          
          <FormControl 
            isInvalid={!!errors.soundcloudId} 
            isDisabled={activeSource === 'mixcloud'}
          >
            <FormLabel 
              htmlFor="soundcloudId" 
              color={activeSource === 'mixcloud' ? 'gray.400' : undefined}
            >
              Soundcloud ID {activeSource === 'mixcloud' && '(Disabled)'}
            </FormLabel>
            <Input
              id="soundcloudId"
              {...register('soundcloudId')}
              placeholder="e.g., 123456789"
              opacity={activeSource === 'mixcloud' ? 0.5 : 1}
              _disabled={{ cursor: 'not-allowed', opacity: 0.5 }}
            />
            {errors.soundcloudId && (
                <FormErrorMessage>{errors.soundcloudId.message}</FormErrorMessage>
            )}
          </FormControl>
        </Grid>
      </Box>
      
      <Flex justify="flex-end" mt={8} gap={4}>
        <ChakraButton
          variant="outline"
          onClick={onCancel}
          isDisabled={isLoading}
        >
          Cancel
        </ChakraButton>
        <ChakraButton
          type="submit"
          colorScheme="blue"
          isLoading={isLoading}
          leftIcon={isLoading ? <Spinner size="sm" /> : undefined}
        >
          {initialData?._id ? 'Update Show' : 'Add Show'}
        </ChakraButton>
      </Flex>
    </Box>
  );
} 