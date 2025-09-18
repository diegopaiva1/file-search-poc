import React, { useState, useCallback } from "react";
import toast from "react-hot-toast";
import {
  VStack,
  Text,
  Heading,
  Container,
  Box,
  Flex,
  Input,
  Button,
  Icon,
} from "@chakra-ui/react";
import { MagnifyingGlassIcon } from "@heroicons/react/24/outline";
import { fileApi, FileEntity } from "../services/api";
import SearchResults from "../components/SearchResults";
import Pagination from "../components/Pagination";
import { downloadFile } from "../utils/file";

const SearchPage: React.FC = () => {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<FileEntity[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [hasSearched, setHasSearched] = useState(false);

  const performSearch = useCallback(
    async (searchQuery: string, page = 1) => {
      if (!searchQuery.trim()) {
        return;
      }

      setLoading(true);

      try {
        const offset = (page - 1) * itemsPerPage;
        const response = await fileApi.searchFiles(
          searchQuery,
          itemsPerPage,
          offset
        );
        setResults(response.files);
        setTotal(response.total);
        setCurrentPage(page);
        setHasSearched(true);
      } catch (error) {
        toast.error("Search failed. Please try again.");
        console.error("Search error:", error);
      } finally {
        setLoading(false);
      }
    },
    [itemsPerPage]
  );

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    await performSearch(query, 1);
  };

  const handlePageChange = (page: number) => {
    performSearch(query, page);
  };

  const handleDownload = async (file: FileEntity) => {
    try {
      await downloadFile(file);
    } catch (error) {
      toast.error("Failed to download file");
      console.error("Download error:", error);
    }
  };

  const handleDelete = async (file: FileEntity) => {
    if (
      !window.confirm(`Are you sure you want to delete "${file.originalName}"?`)
    ) {
      return;
    }

    try {
      await fileApi.deleteFile(file.id);
      setResults((prev) => prev.filter((f) => f.id !== file.id));
      setTotal((prev) => prev - 1);
      toast.success("File deleted successfully");

      // If we deleted the last item on this page and it's not the first page, go back one page
      if (results.length === 1 && currentPage > 1) {
        handlePageChange(currentPage - 1);
      }
    } catch (error) {
      toast.error("Failed to delete file");
      console.error("Delete error:", error);
    }
  };

  return (
    <Box minH="100vh" bg="gray.50">
      <Container maxW="6xl" py={8}>
        {/* Header Section */}
        <VStack spacing={6} textAlign="center" mb={8}>
          <Heading as="h1" size="xl" color="gray.900">
            Search Your Files
          </Heading>
          <Text fontSize="md" color="gray.600">
            Find content across all your uploaded documents
          </Text>
        </VStack>

        {/* Search Form */}
        <Box mb={8}>
          <Box as="form" onSubmit={handleSearch}>
            <VStack spacing={4}>
              <Flex gap={4} w="full" maxW="2xl" mx="auto">
                <Box flex={1} position="relative">
                  <Box position="relative">
                    <Box
                      position="absolute"
                      left={3}
                      top="50%"
                      transform="translateY(-50%)"
                      pointerEvents="none"
                      zIndex={1}
                    >
                      <Icon
                        as={MagnifyingGlassIcon}
                        h={5}
                        w={5}
                        color="gray.400"
                      />
                    </Box>
                    <Input
                      type="text"
                      value={query}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                        setQuery(e.target.value)
                      }
                      placeholder="Search for content within your files..."
                      bg="white"
                      border="1px"
                      borderColor="gray.300"
                      pl={10}
                      size="lg"
                      rounded="lg"
                      _placeholder={{ color: "gray.500" }}
                      _focus={{
                        outline: "none",
                        borderColor: "indigo.500",
                        boxShadow: "0 0 0 1px #4f46e5",
                      }}
                    />
                  </Box>
                </Box>
                <Button
                  type="submit"
                  isDisabled={loading || !query.trim()}
                  isLoading={loading}
                  loadingText="Searching..."
                  colorScheme="indigo"
                  size="lg"
                  px={8}
                  rounded="lg"
                >
                  Search
                </Button>
              </Flex>

              <Text fontSize="sm" color="gray.500" textAlign="center">
                Using full-text search to find content within your files
              </Text>
            </VStack>
          </Box>
        </Box>

        {/* Search Results */}
        {hasSearched && (
          <Box
            border="1px"
            borderColor="gray.200"
            bg="white"
            rounded="xl"
            shadow="sm"
            mb={6}
            overflow="hidden"
          >
            <SearchResults
              files={results}
              total={total}
              loading={loading}
              onDownload={handleDownload}
              onDelete={handleDelete}
            />

            {/* Pagination */}
            {total > itemsPerPage && !loading && (
              <Flex
                borderTop="1px"
                borderColor="gray.100"
                justify="center"
                align="center"
                py={4}
                bg="gray.50"
              >
                <Pagination
                  currentPage={currentPage}
                  totalItems={total}
                  itemsPerPage={itemsPerPage}
                  onPageChange={handlePageChange}
                />
              </Flex>
            )}
          </Box>
        )}
      </Container>
    </Box>
  );
};

export default SearchPage;
