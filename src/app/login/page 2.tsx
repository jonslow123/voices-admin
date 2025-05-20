'use client';

import { useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Formik, Form, Field } from 'formik';
import * as Yup from 'yup';
import { toast } from 'react-toastify';
import Link from 'next/link';
import {
  Box,
  Button,
  FormControl,
  FormErrorMessage,
  FormLabel,
  Heading,
  Input,
  Text,
  VStack,
  useColorModeValue,
} from '@chakra-ui/react';

const LoginSchema = Yup.object().shape({
  email: Yup.string()
    .email('Invalid email address')
    .required('Email is required'),
  password: Yup.string()
    .required('Password is required')
    .min(6, 'Password must be at least 6 characters'),
});

export default function LoginPage() {
  const { login, isLoading, error } = useAuth();

  useEffect(() => {
    if (error) {
      toast.error(error);
    }
  }, [error]);

  const formBackground = useColorModeValue('gray.100', 'gray.700');
  const cardBackground = useColorModeValue('white', 'gray.800');

  return (
    <Box minH="100vh" display="flex" flexDirection="column" alignItems="center" justifyContent="center" bg={useColorModeValue('gray.50', 'gray.900')} p={4}>
      <VStack spacing={8} w="full" maxW="md">
        <Box textAlign="center">
          <Link href="/" passHref>
            <Heading as="h1" size="2xl" color="purple.500" _hover={{ color: 'purple.400' }}>
              Voices Admin
            </Heading>
          </Link>
          <Text color={useColorModeValue('gray.600', 'gray.400')} mt={2}>
            Sign in to manage your Voices Radio content.
          </Text>
        </Box>

        <Box bg={cardBackground} p={8} borderRadius="xl" shadow="xl" w="full">
          <Formik
            initialValues={{ email: '', password: '' }}
            validationSchema={LoginSchema}
            onSubmit={async (values) => {
              try {
                await login(values.email, values.password);
              } catch (err) {
                // Error is caught and set in AuthContext, then displayed by useEffect toast
                // If login function in AuthContext doesn't throw an error that AuthContext itself catches
                // and sets to 'error' state, you might need to handle it here too.
                // For example: toast.error("An unexpected error occurred during login.");
              }
            }}
          >
            {({ isSubmitting, errors, touched }) => (
              <Form>
                <VStack spacing={6}>
                  <Field name="email">
                    {({ field, form }: any) => (
                      <FormControl isInvalid={form.errors.email && form.touched.email}>
                        <FormLabel htmlFor="email" color={useColorModeValue('gray.700', 'gray.300')}>Email Address</FormLabel>
                        <Input {...field} id="email" placeholder="you@example.com" focusBorderColor="purple.500" />
                        <FormErrorMessage>{form.errors.email}</FormErrorMessage>
                      </FormControl>
                    )}
                  </Field>

                  <Field name="password">
                    {({ field, form }: any) => (
                      <FormControl isInvalid={form.errors.password && form.touched.password}>
                        <FormLabel htmlFor="password" color={useColorModeValue('gray.700', 'gray.300')}>Password</FormLabel>
                        <Input {...field} id="password" type="password" placeholder="••••••••" focusBorderColor="purple.500" />
                        <FormErrorMessage>{form.errors.password}</FormErrorMessage>
                      </FormControl>
                    )}
                  </Field>

                  <Button
                    type="submit"
                    colorScheme="purple"
                    isLoading={isSubmitting || isLoading}
                    width="full"
                  >
                    Sign In
                  </Button>
                </VStack>
              </Form>
            )}
          </Formik>
        </Box>
      </VStack>
    </Box>
  );
} 