import React from "react";
import {
  Box,
  VStack,
  Flex,
  Text,
  Icon,
  Spinner,
  Heading,
} from "@chakra-ui/react";
import { DocumentTextIcon } from "@heroicons/react/24/outline";
import { FileEntity } from "../services/api";
import FileCard from "./FileCard";

interface SearchResultsProps {
  files: FileEntity[];
  total: number;
  loading: boolean;
  onDownload?: (file: FileEntity) => void;
  onDelete?: (file: FileEntity) => void;
}

const SearchResults: React.FC<SearchResultsProps> = ({
  files,
  total,
  loading,
  onDownload,
  onDelete,
}) => {
  if (loading) {
    return (
      <Flex justify="center" align="center" py={12}>
        <Spinner size="lg" color="indigo.500" />
        <Text ml={3} color="gray.600">
          Searching...
        </Text>
      </Flex>
    );
  }

  if (files.length === 0) {
    return (
      <VStack spacing={4} py={12}>
        <Icon as={DocumentTextIcon} mx="auto" h={12} w={12} color="gray.400" />
        <Heading as="h3" size="sm" color="gray.900">
          No files found
        </Heading>
        <Text fontSize="sm" color="gray.500">
          Try adjusting your search terms or upload some files first.
        </Text>
      </VStack>
    );
  }

  return (
    <Box shadow="sm" overflow="hidden" w="full">
      <Box bg="gray.50" px={6} py={3} borderBottomWidth="1px">
        <Text fontSize="sm" color="gray.600">
          Found {total} file{total !== 1 ? "s" : ""} - Ranked by relevance
        </Text>
      </Box>

      <VStack spacing={6} align="stretch" p={6}>
        {files.map((file) => (
          <FileCard
            key={file.id}
            file={file}
            onDownload={onDownload}
            onDelete={onDelete}
          />
        ))}
      </VStack>
    </Box>
  );
};

export default SearchResults;
