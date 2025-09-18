import React from "react";
import {
  Box,
  Flex,
  Text,
  Heading,
  HStack,
  ButtonGroup,
  Button,
  Badge,
} from "@chakra-ui/react";
import { FileEntity, ProcessingStatus } from "../services/api";
import { formatDistanceToNow } from "date-fns";
import { formatFileSize } from "../utils/file";

interface FileCardProps {
  file: FileEntity;
  onDownload?: (file: FileEntity) => void;
  onDelete?: (file: FileEntity) => void;
}

const getFileIcon = (mimeType: string) => {
  if (mimeType.startsWith("image/")) {
    return "🖼️";
  }

  if (mimeType === "application/pdf") {
    return "📄";
  }

  if (mimeType.includes("word") || mimeType.includes("document")) {
    return "📝";
  }

  if (mimeType.includes("excel") || mimeType.includes("spreadsheet")) {
    return "📊";
  }

  if (mimeType.startsWith("text/")) {
    return "📃";
  }

  return "📎";
};

const getStatusBadge = (status: ProcessingStatus) => {
  const statusConfig: Record<
    ProcessingStatus,
    { colorScheme: string; text: string }
  > = {
    pending: { colorScheme: "yellow", text: "Pending" },
    processing: { colorScheme: "blue", text: "Processing" },
    completed: { colorScheme: "green", text: "Ready" },
    failed: { colorScheme: "red", text: "Failed" },
    unknown: { colorScheme: "gray", text: "Unknown" },
  };

  const config = statusConfig[status];

  return (
    <Badge colorScheme={config.colorScheme} size="sm">
      {config.text}
    </Badge>
  );
};

const FileCard: React.FC<FileCardProps> = ({ file, onDownload, onDelete }) => {
  return (
    <Box
      bg="white"
      p={6}
      rounded="lg"
      shadow="base"
      border="1px"
      borderColor="gray.200"
      _hover={{ shadow: "md" }}
      transition="shadow 0.2s"
      w="full"
      position="relative"
    >
      <Box width="full">
        <Flex justifyContent="space-between" alignItems="flex-start">
          <HStack spacing={2} mb={2}>
            <Text fontSize="2xl">{getFileIcon(file.mimeType)}</Text>
            <Heading as="h3" size="md" color="gray.900">
              {file.originalName}
            </Heading>
            {getStatusBadge(file.latestJobStatus)}
          </HStack>
          <ButtonGroup spacing={2} flexShrink={0} ml={4}>
            {onDownload && (
              <Button
                onClick={() => onDownload(file)}
                size="sm"
                colorScheme="indigo"
                variant="outline"
              >
                Download
              </Button>
            )}
            {onDelete && (
              <Button
                onClick={() => onDelete(file)}
                size="sm"
                colorScheme="red"
                variant="outline"
              >
                Delete
              </Button>
            )}
          </ButtonGroup>
        </Flex>

        <Flex
          wrap="wrap"
          align="center"
          gap={4}
          fontSize="sm"
          color="gray.500"
          mb={3}
        >
          <Text>{formatFileSize(file.sizeBytes)}</Text>
          <Text>{file.mimeType}</Text>
          <Text>
            Uploaded {formatDistanceToNow(new Date(file.createdAt))} ago
          </Text>
        </Flex>

        {file.snippet && (
          <Box bg="gray.50" p={3} rounded="md" w="full" mb={2}>
            <Text fontSize="sm" color="gray.700">
              <Text as="span" fontWeight="medium">
                Preview:{" "}
              </Text>
              <Text
                as="span"
                dangerouslySetInnerHTML={{ __html: file.snippet }}
              />
            </Text>
          </Box>
        )}

        {file.latestJobStatus === "failed" && file.latestJobErrorMessage && (
          <Box
            mt={2}
            p={2}
            bg="red.50"
            border="1px"
            borderColor="red.200"
            rounded="md"
          >
            <Text fontSize="sm" color="red.700">
              <Text as="span" fontWeight="bold">
                Processing Error:
              </Text>{" "}
              {file.latestJobErrorMessage}
            </Text>
          </Box>
        )}
      </Box>
    </Box>
  );
};

export default FileCard;
