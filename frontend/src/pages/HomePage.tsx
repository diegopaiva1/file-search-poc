import React from "react";
import {
  Box,
  VStack,
  Text,
  Heading,
  Container,
  OrderedList,
  ListItem
} from "@chakra-ui/react";
import FileUpload from "../components/FileUpload";

const HomePage: React.FC = () => {
  return (
    <VStack spacing={8}>
      <VStack spacing={4} textAlign="center">
        <Heading as="h1" size="2xl" color="gray.900">
          Upload Your Files
        </Heading>
        <Text fontSize="lg" color="gray.600" maxW="2xl" mx="auto">
          Upload documents, images, and other files to make their content
          searchable. We support PDFs, Word documents, Excel files, images with
          text, and more.
        </Text>
      </VStack>

      <Container maxW="3xl">
        <FileUpload />
      </Container>

      <Container maxW="3xl" mt={12}>
        <Box bg="blue.50" border="1px" borderColor="blue.200" rounded="lg" p={6}>
          <Heading as="h3" size="lg" color="blue.900" mb={3}>
            How it works
          </Heading>
          <OrderedList spacing={2} color="blue.800" ml={4}>
            <ListItem>Upload your files using the area above</ListItem>
            <ListItem>Our system extracts text content from your files</ListItem>
            <ListItem>Search through all your files using the search page</ListItem>
            <ListItem>Find relevant content quickly with full-text search</ListItem>
          </OrderedList>
        </Box>
      </Container>
    </VStack>
  );
};

export default HomePage;
