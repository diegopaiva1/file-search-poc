import toast from "react-hot-toast";
import React, { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import {
  Box,
  VStack,
  Text,
  Icon,
  Spinner,
  Flex,
  HStack,
  IconButton,
  Badge,
  Heading,
} from "@chakra-ui/react";
import {
  DocumentArrowUpIcon,
  XMarkIcon,
  ArrowPathIcon,
} from "@heroicons/react/24/outline";
import { fileApi, FileEntity } from "../services/api";
import { formatFileSize } from "../utils/file";

interface FileUploadProps {
  onFileUploaded?: (file: FileEntity) => void;
}

const FileUpload: React.FC<FileUploadProps> = ({ onFileUploaded }) => {
  const [uploading, setUploading] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<FileEntity[]>([]);

  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      setUploading(true);

      try {
        const uploadPromises = acceptedFiles.map(async (file) => {
          const uploadedFile = await fileApi.uploadFile(file);
          return uploadedFile;
        });

        const results = await Promise.all(uploadPromises);
        setUploadedFiles((prev) => [...prev, ...results]);

        const newFiles = results.filter((file) => !file.isDuplicate);
        const duplicates = results.filter((file) => file.isDuplicate);

        // Show summary toast
        if (results.length > 1) {
          if (duplicates.length > 0 && newFiles.length > 0) {
            const duplicateNames = duplicates
              .map((f) => f.attemptedFileName || f.originalName)
              .join(", ");

            toast(
              `${newFiles.length} new files uploaded, ${
                duplicates.length
              } duplicate${
                duplicates.length > 1 ? "s" : ""
              } found: ${duplicateNames}`,
              {
                icon: "📁",
                duration: 6000,
              }
            );
          } else if (duplicates.length === results.length) {
            const duplicateNames = duplicates
              .map((f) => f.attemptedFileName || f.originalName)
              .join(", ");

            toast(`All files were duplicates: ${duplicateNames}`, {
              icon: "🔄",
              duration: 6000,
            });
          } else {
            toast.success(`${newFiles.length} files uploaded successfully!`);
          }
        } else {
          // Single file - show individual message
          const file = results[0];

          if (file.isDuplicate) {
            toast(`File already exists - using existing file`, {
              icon: "🔄",
              duration: 4000,
            });
          } else {
            toast.success("File uploaded successfully!");
          }
        }

        results.forEach((file) => {
          onFileUploaded?.(file);
        });
      } catch (error) {
        toast.error("Failed to upload files");
        console.error("Upload error:", error);
      } finally {
        setUploading(false);
      }
    },
    [onFileUploaded]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    multiple: true,
    maxSize: 100 * 1024 * 1024, // 100MB
    accept: {
      "text/plain": [".txt"],
      "application/pdf": [".pdf"],
      "application/msword": [".doc"],
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
        [".docx"],
      "application/vnd.ms-excel": [".xls"],
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": [
        ".xlsx",
      ],
      "image/*": [".png", ".jpg", ".jpeg", ".gif", ".tiff"],
      "text/csv": [".csv"],
    },
  });

  const removeFile = (fileId: string) => {
    setUploadedFiles((prev) => prev.filter((f) => f.id !== fileId));
  };

  return (
    <VStack spacing={6}>
      <Box
        {...getRootProps()}
        border="2px"
        borderStyle="dashed"
        borderRadius="lg"
        p={8}
        textAlign="center"
        cursor="pointer"
        transition="all 0.2s"
        borderColor={isDragActive ? "indigo.500" : "gray.300"}
        bg={isDragActive ? "indigo.50" : "white"}
        _hover={{
          borderColor: "gray.400",
        }}
        opacity={uploading ? 0.5 : 1}
        pointerEvents={uploading ? "none" : "auto"}
      >
        <input {...getInputProps()} disabled={uploading} />
        <Icon
          as={DocumentArrowUpIcon}
          mx="auto"
          h={12}
          w={12}
          color="gray.400"
        />
        <Text mt={2} fontSize="lg" fontWeight="medium" color="gray.900">
          {isDragActive ? "Drop files here" : "Upload files"}
        </Text>
        <Text mt={1} fontSize="sm" color="gray.500">
          Drag and drop files here, or click to select files
        </Text>
        <Text mt={1} fontSize="xs" color="gray.400">
          Supports: PDF, DOC, DOCX, XLS, XLSX, TXT, CSV, Images (max 100MB each)
        </Text>

        {uploading && (
          <VStack mt={4} spacing={2}>
            <Spinner size="md" color="indigo.500" />
            <Text fontSize="sm" color="gray.600">
              Uploading...
            </Text>
          </VStack>
        )}
      </Box>

      {uploadedFiles.length > 0 && (
        <Box bg="white" shadow="md" rounded="lg" w="full">
          <Box px={{ base: 4, sm: 6 }} py={5}>
            <Heading as="h3" size="md" color="gray.900" mb={4}>
              Recently Uploaded Files
            </Heading>
            <VStack spacing={3}>
              {uploadedFiles.map((file) => (
                <Flex
                  key={file.id}
                  align="center"
                  justify="space-between"
                  p={3}
                  rounded="md"
                  w="full"
                  bg={file.isDuplicate ? "amber.50" : "gray.50"}
                  border={file.isDuplicate ? "1px" : "none"}
                  borderColor={file.isDuplicate ? "amber.200" : "transparent"}
                >
                  <HStack spacing={3}>
                    <Icon
                      as={
                        file.isDuplicate ? ArrowPathIcon : DocumentArrowUpIcon
                      }
                      h={5}
                      w={5}
                      color={file.isDuplicate ? "amber.500" : "gray.400"}
                    />
                    <Box>
                      <HStack spacing={2}>
                        <Text
                          fontSize="sm"
                          fontWeight="medium"
                          color="gray.900"
                        >
                          {file.isDuplicate &&
                          file.attemptedFileName &&
                          file.attemptedFileName !== file.originalName
                            ? `${file.attemptedFileName} → ${file.originalName}`
                            : file.originalName}
                        </Text>
                        {file.isDuplicate && (
                          <Badge colorScheme="amber" size="sm">
                            Duplicate
                          </Badge>
                        )}
                      </HStack>
                      <Text fontSize="xs" color="gray.500">
                        {formatFileSize(file.sizeBytes)} • {file.mimeType}
                      </Text>
                    </Box>
                  </HStack>
                  <IconButton
                    aria-label="Remove file"
                    size="sm"
                    variant="ghost"
                    color="gray.400"
                    _hover={{ color: "gray.600" }}
                    onClick={() => removeFile(file.id)}
                  >
                    <Icon as={XMarkIcon} h={4} w={4} />
                  </IconButton>
                </Flex>
              ))}
            </VStack>
          </Box>
        </Box>
      )}
    </VStack>
  );
};

export default FileUpload;
