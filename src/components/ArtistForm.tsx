import { useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { Artist } from '@/types/artist';
import { fetchSoundCloudArtistData } from '@/lib/api';
import {
  Box,
  Button as ChakraButton,
  Checkbox,
  FormControl,
  FormErrorMessage,
  FormLabel,
  Grid,
  Heading,
  Input,
  Textarea,
  Flex,
  Tag,
  TagLabel,
  TagCloseButton,
  useToast,
  HStack,
  IconButton,
  Spinner,
  Text
} from '@chakra-ui/react';
import { AddIcon, CloseIcon } from '@chakra-ui/icons';

interface ArtistFormProps {
  initialData?: Partial<Artist>;
  onSubmit: (data: Partial<Artist>) => void;
  isLoading: boolean;
}

export default function ArtistForm({ initialData, onSubmit, isLoading }: ArtistFormProps) {
  const [isFetching, setIsFetching] = useState(false);
  const toast = useToast();
  
  const { register, handleSubmit, control, formState: { errors }, watch, setValue, reset } = useForm<Partial<Artist>>({
    defaultValues: {
      name: initialData?.name || '',
      bio: initialData?.bio || '',
      imageUrl: initialData?.imageUrl || '',
      bannerUrl: initialData?.bannerUrl || '',
      genres: initialData?.genres || [],
      mixcloudUsername: initialData?.mixcloudUsername || '',
      soundcloudUsername: initialData?.soundcloudUsername || '',
      isActive: initialData?.isActive || true,
      featured: initialData?.featured || false,
      socialLinks: initialData?.socialLinks || {
        instagram: '',
        facebook: '',
        twitter: '',
        website: ''
      },
    }
  });

  const [genreInput, setGenreInput] = useState('');
  const genres = watch('genres', initialData?.genres || []);
  const soundcloudUrl = watch('soundcloudUsername');
  const [shows, setShows] = useState<any[]>(initialData?.shows || []);

  const addGenre = () => {
    const currentGenres = genres || [];
    if (genreInput.trim() && !currentGenres.includes(genreInput.trim())) {
      setValue('genres', [...currentGenres, genreInput.trim()]);
      setGenreInput('');
    } else if (currentGenres.includes(genreInput.trim())) {
      toast({
        title: "Genre already added.",
        status: "warning",
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const removeGenre = (genreToRemove: string) => {
    const currentGenres = genres || [];
    setValue('genres', currentGenres.filter(genre => genre !== genreToRemove));
  };

  const fetchArtistDetails = async () => {
    if (!soundcloudUrl) {
      toast({
        title: "URL Required",
        description: "Please enter a SoundCloud URL",
        status: "warning",
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    let url = soundcloudUrl;
    if (!url.startsWith('http')) {
      url = `https://soundcloud.com/${url}`;
    }

    try {
      setIsFetching(true);
      
      const artistData = await fetchSoundCloudArtistData(url);
      
      setValue('name', artistData.name || '');
      setValue('bio', artistData.bio || '');
      setValue('imageUrl', artistData.profileImageUrl || '');
      setValue('soundcloudUsername', artistData.soundcloudUsername || '');
      
      if (artistData.primaryGenres && artistData.primaryGenres.length > 0) {
        setValue('genres', artistData.primaryGenres);
      }
      
      toast({
        title: "Artist data loaded",
        description: "Successfully loaded artist details from SoundCloud",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
      
    } catch (error) {
      console.error('Error fetching artist details:', error);
      toast({
        title: "Error",
        description: "Failed to fetch artist details. Please fill in the fields manually.",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsFetching(false);
    }
  };

  const handleAddShow = (show: any) => {
    setShows(prevShows => [...prevShows, show]);
  };

  const handleFormSubmit = (data: Partial<Artist>) => {
    const formData = {
      ...data,
      shows: shows
    };
    
    console.log('Submitting artist data:', formData);
    onSubmit(formData);
  };

  return (
    <Box as="form" onSubmit={handleSubmit(handleFormSubmit)} width="100%">
      <Box borderWidth="1px" borderRadius="lg" p={6} mb={6} boxShadow="md">
        <Heading as="h2" size="lg" mb={6} fontWeight="semibold">
          Profile URL
        </Heading>
        <Flex>
          <Input
            value={soundcloudUrl || ''}
            onChange={(e) => {
              setValue('soundcloudUsername', e.target.value);
            }}
            placeholder="https://soundcloud.com/username or just username"
            mr={2}
          />
          <ChakraButton
            onClick={fetchArtistDetails}
            isLoading={isFetching}
            loadingText="Fetching"
            colorScheme="orange"
          >
            Fetch
          </ChakraButton>
        </Flex>
      </Box>
      <Box borderWidth="1px" borderRadius="lg" p={6} mb={6} boxShadow="md">
        <Heading as="h2" size="lg" mb={6} fontWeight="semibold">
          Basic Information
        </Heading>
        
        <Grid templateColumns={{ base: "1fr", md: "repeat(2, 1fr)" }} gap={6}>
          <FormControl isInvalid={!!errors.name}isRequired>
            <FormLabel htmlFor="name">Name</FormLabel>
            <Input
              id="name"
              {...register('name', { required: 'Name is required' })}
              placeholder="Artist Name"
            />
            {errors.name && (
              <FormErrorMessage>{errors.name.message}</FormErrorMessage>
            )}
          </FormControl>
          
          <FormControl isInvalid={!!errors.imageUrl}>
            <FormLabel htmlFor="imageUrl">Profile Image URL</FormLabel>
            <Input
              id="imageUrl"
              {...register('imageUrl')}
              placeholder="https://example.com/image.jpg"
            />
             {errors.imageUrl && (
              <FormErrorMessage>{errors.imageUrl.message}</FormErrorMessage>
            )}
          </FormControl>
          
          <Box gridColumn={{ base: "1 / -1", md: "span 2" }}>
            <FormControl isInvalid={!!errors.bio}>
              <FormLabel htmlFor="bio">Bio</FormLabel>
              <Textarea
                id="bio"
                rows={4}
                {...register('bio')}
                placeholder="Artist biography..."
              />
              {errors.bio && (
                <FormErrorMessage>{errors.bio.message}</FormErrorMessage>
              )}
            </FormControl>
          </Box>
        </Grid>
      </Box>
      
      <Box borderWidth="1px" borderRadius="lg" p={6} mb={6} boxShadow="md">
        <Heading as="h2" size="lg" mb={6} fontWeight="semibold">
          Genres
        </Heading>
        <Box mb={2}>
          <Heading as="h3" size="sm" mb={1}>Primary Genres</Heading>
          <Flex wrap="wrap" gap={2} mb={2}>
            {(genres || []).slice(0, 3).map((genre) => (
              <Tag
                size="lg"
                key={genre}
                borderRadius="full"
                variant="solid"
                colorScheme="blue"
              >
                <TagLabel>{genre}</TagLabel>
                <TagCloseButton onClick={() => removeGenre(genre)} />
              </Tag>
            ))}
            {(genres || []).length === 0 && <Text color="gray.400">No genres added.</Text>}
          </Flex>
        </Box>
        {(genres || []).length > 3 && (
          <Box mb={2}>
            <Heading as="h3" size="sm" mb={1}>Other Genres</Heading>
            <Flex wrap="wrap" gap={2} mb={2}>
              {(genres || []).slice(3).map((genre) => (
                <Tag
                  size="lg"
                  key={genre}
                  borderRadius="full"
                  variant="subtle"
                  colorScheme="gray"
                >
                  <TagLabel>{genre}</TagLabel>
                  <TagCloseButton onClick={() => removeGenre(genre)} />
                </Tag>
              ))}
            </Flex>
          </Box>
        )}
        <Flex gap={2}>
          <Input
            value={genreInput}
            onChange={(e) => setGenreInput(e.target.value)}
            onKeyPress={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                addGenre();
              }
            }}
            placeholder="Add genre and press Enter or click Add"
            flex="1"
          />
          <ChakraButton 
            leftIcon={<AddIcon />}
            onClick={addGenre}
            colorScheme="blue"
            variant="outline"
          >
            Add
          </ChakraButton>
        </Flex>
      </Box>
      
      <Box borderWidth="1px" borderRadius="lg" p={6} mb={6} boxShadow="md">
        <Heading as="h2" size="lg" mb={6} fontWeight="semibold">
          Profile Links
        </Heading>
        <Grid templateColumns={{ base: "1fr", md: "repeat(2, 1fr)" }} gap={6}>
          <FormControl isInvalid={!!errors.mixcloudUsername}>
            <FormLabel htmlFor="mixcloudUsername">Mixcloud Username</FormLabel>
            <Input
              id="mixcloudUsername"
              {...register('mixcloudUsername')}
              placeholder="artist-on-mixcloud"
            />
            {errors.mixcloudUsername && (
              <FormErrorMessage>{errors.mixcloudUsername.message}</FormErrorMessage>
            )}
          </FormControl>
          
          <FormControl isInvalid={!!errors.soundcloudUsername}>
            <FormLabel htmlFor="soundcloudUsername">Soundcloud Username</FormLabel>
            <Input
              id="soundcloudUsername"
              value={soundcloudUrl || ''}
              onChange={(e) => setValue('soundcloudUsername', e.target.value)}
              placeholder="artist-on-soundcloud"
            />
            {errors.soundcloudUsername && (
              <FormErrorMessage>{errors.soundcloudUsername.message}</FormErrorMessage>
            )}
          </FormControl>
          
          <FormControl isInvalid={!!errors.socialLinks?.instagram}>
            <FormLabel htmlFor="instagram">Instagram URL</FormLabel>
            <Input
              id="instagram"
              {...register('socialLinks.instagram')}
              placeholder="https://instagram.com/artist"
            />
            {errors.socialLinks?.instagram && (
              <FormErrorMessage>{errors.socialLinks.instagram.message}</FormErrorMessage>
            )}
          </FormControl>
          
          <FormControl isInvalid={!!errors.socialLinks?.facebook}>
            <FormLabel htmlFor="facebook">Facebook URL</FormLabel>
            <Input
              id="facebook"
              {...register('socialLinks.facebook')}
              placeholder="https://facebook.com/artist"
            />
            {errors.socialLinks?.facebook && (
              <FormErrorMessage>{errors.socialLinks.facebook.message}</FormErrorMessage>
            )}
          </FormControl>
          
          <FormControl isInvalid={!!errors.socialLinks?.twitter}>
            <FormLabel htmlFor="twitter">Twitter URL</FormLabel>
            <Input
              id="twitter"
              {...register('socialLinks.twitter')}
              placeholder="https://twitter.com/artist"
            />
            {errors.socialLinks?.twitter && (
              <FormErrorMessage>{errors.socialLinks.twitter.message}</FormErrorMessage>
            )}
          </FormControl>
          
          <FormControl isInvalid={!!errors.socialLinks?.website}>
            <FormLabel htmlFor="website">Website URL</FormLabel>
            <Input
              id="website"
              {...register('socialLinks.website')}
              placeholder="https://artistwebsite.com"
            />
            {errors.socialLinks?.website && (
              <FormErrorMessage>{errors.socialLinks?.website.message}</FormErrorMessage>
            )}
          </FormControl>
        </Grid>
      </Box>
      
      <Box borderWidth="1px" borderRadius="lg" p={6} mb={6} boxShadow="md">
        <Heading as="h2" size="lg" mb={6} fontWeight="semibold">
          Status
        </Heading>
        <Grid templateColumns={{ base: "1fr", sm: "repeat(3, 1fr)" }} gap={6}>
          <FormControl>
            <Checkbox
              id="isActive"
              {...register('isActive')}
              size="lg"
              colorScheme="green"
            >
              Active
            </Checkbox>
          </FormControl>
          <FormControl>
            <Checkbox
              id="featured"
              {...register('featured')}
              size="lg"
              colorScheme="orange"
            >
              Featured Artist
            </Checkbox>
          </FormControl>
        </Grid>
      </Box>
      
      <Box borderWidth="1px" borderRadius="lg" p={6} mb={6} boxShadow="md">
        <Heading as="h2" size="lg" mb={6} fontWeight="semibold">
          Shows
        </Heading>
        
        {shows.length > 0 ? (
          <Box mb={4}>
            {shows.map((show, index) => (
              <Box key={index} p={3} borderWidth="1px" borderRadius="md" mb={2}>
                <Flex justify="space-between" align="center">
                  <Box>
                    <Text fontWeight="bold">{show.title}</Text>
                    <Text fontSize="sm">{show.date}</Text>
                  </Box>
                  <IconButton
                    aria-label="Remove show"
                    icon={<CloseIcon />}
                    size="sm"
                    onClick={() => setShows(prevShows => prevShows.filter((_, i) => i !== index))}
                  />
                </Flex>
              </Box>
            ))}
          </Box>
        ) : (
          <Text color="gray.500" mb={4}>No shows added yet.</Text>
        )}
        
        {initialData?._id ? (
          <Text>You can add shows once the artist is created.</Text>
        ) : (
          <Box>
            <Text mb={2}>Add shows after creating the artist.</Text>
          </Box>
        )}
      </Box>
      
      <Flex justify="flex-end" mt={8}>
        <ChakraButton
          type="submit"
          colorScheme="blue"
          size="lg"
          isLoading={isLoading}
          leftIcon={isLoading ? <Spinner size="sm" /> : undefined}
        >
          {initialData?._id ? 'Update Artist' : 'Create Artist'}
        </ChakraButton>
      </Flex>
    </Box>
  );
} 