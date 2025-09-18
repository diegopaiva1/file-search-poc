import toast from "react-hot-toast";
import React, { useState, useEffect, useCallback } from "react";
import {
  Box,
  VStack,
  Flex,
  Text,
  Heading,
  Container,
  Button,
  Spinner,
} from "@chakra-ui/react";
import { fileApi, FileEntity } from "../services/api";
import { downloadFile } from "../utils/file";
import FileCard from "../components/FileCard";
import Pagination from "../components/Pagination";

const FilesPage: React.FC = () => {
  const [files, setFiles] = useState<FileEntity[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

  const loadFiles = useCallback(
    async (page = 1) => {
      setLoading(true);

      try {
        const offset = (page - 1) * itemsPerPage;
        const response = await fileApi.getAllFiles(itemsPerPage, offset);
        setFiles(response.files);
        setTotal(response.total);
        setCurrentPage(page);
      } catch (error) {
        toast.error("Failed to load files");
        console.error("Load files error:", error);
      } finally {
        setLoading(false);
      }
    },
    [itemsPerPage]
  );

  useEffect(() => {
    loadFiles(1);
  }, [loadFiles]);

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
      setFiles((prev) => prev.filter((f) => f.id !== file.id));
      setTotal((prev) => prev - 1);
      toast.success("File deleted successfully");

      // If we deleted the last item on this page and it's not the first page, go back one page
      if (files.length === 1 && currentPage > 1) {
        loadFiles(currentPage - 1);
      }
    } catch (error) {
      toast.error("Failed to delete file");
      console.error("Delete error:", error);
    }
  };

  const handlePageChange = (page: number) => {
    loadFiles(page);
  };

  return (
    <Box minH="100vh" bg="gray.50">
      <Container maxW="6xl" py={8}>
        {/* Header Section */}
        <Box mb={8}>
          <Flex justify="space-between" align="flex-start" mb={6}>
            <Box>
              <Heading as="h1" size="xl" color="gray.900" mb={2}>
                All Files
              </Heading>
              <Text fontSize="md" color="gray.600">
                Manage and browse all your uploaded files
              </Text>
            </Box>
            <Button
              onClick={() => loadFiles(currentPage)}
              colorScheme="indigo"
              size="md"
              variant="outline"
              leftIcon={
                <svg
                  width="16"
                  height="16"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z"
                    clipRule="evenodd"
                  />
                </svg>
              }
            >
              Refresh
            </Button>
          </Flex>
        </Box>

        {/* Content Section */}
        {loading ? (
          <Flex justify="center" align="center" py={20}>
            <VStack spacing={4}>
              <Spinner size="lg" color="indigo.500" thickness="3px" />
              <Text color="gray.600" fontSize="sm">
                Loading files...
              </Text>
            </VStack>
          </Flex>
        ) : (
          <>
            {files.length === 0 ? (
              <Flex justify="center" align="center" py={20}>
                <VStack spacing={4} textAlign="center">
                  <Box
                    w={16}
                    h={16}
                    bg="gray.100"
                    rounded="full"
                    display="flex"
                    alignItems="center"
                    justifyContent="center"
                  >
                    <svg
                      width="32"
                      height="32"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                      color="gray.400"
                    >
                      <path
                        fillRule="evenodd"
                        d="M4 4a2 2 0 00-2 2v8a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2H4zm2 6a2 2 0 100-4 2 2 0 000 4zm8-2a2 2 0 11-4 0 2 2 0 014 0zM4 14l4-4 4 4h4V6H4v8z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </Box>
                  <VStack spacing={1}>
                    <Text color="gray.900" fontWeight="medium">
                      No files uploaded yet
                    </Text>
                    <Text color="gray.500" fontSize="sm">
                      Upload some files to get started
                    </Text>
                  </VStack>
                </VStack>
              </Flex>
            ) : (
              <Box
                border="1px"
                borderColor="gray.200"
                bg="white"
                rounded="xl"
                shadow="sm"
                mb={6}
                overflow="hidden"
              >
                <Box bg="gray.50" px={6} py={3} borderBottomWidth="1px">
                  <Text fontSize="sm" color="gray.600">
                    Total files: {total}
                  </Text>
                </Box>

                {/* File List */}
                <VStack spacing={8} align="stretch" p={6}>
                  {files.map((file) => (
                    <FileCard
                      key={file.id}
                      file={file}
                      onDownload={handleDownload}
                      onDelete={handleDelete}
                    />
                  ))}
                </VStack>

                {/* Pagination Footer */}
                {total > itemsPerPage && (
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
          </>
        )}
      </Container>
    </Box>
  );
};

export default FilesPage;
