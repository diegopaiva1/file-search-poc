import React from "react";
import { Flex, Text, Button, IconButton } from "@chakra-ui/react";

interface PaginationProps {
  currentPage: number;
  totalItems: number;
  itemsPerPage: number;
  onPageChange: (page: number) => void;
  maxVisiblePages?: number;
}

const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalItems,
  itemsPerPage,
  onPageChange,
  maxVisiblePages = 5,
}) => {
  const totalPages = Math.ceil(totalItems / itemsPerPage);

  if (totalPages <= 1) {
    return null;
  }

  const startItem = (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, totalItems);

  const getVisiblePages = () => {
    const pages: number[] = [];
    const halfVisible = Math.floor(maxVisiblePages / 2);

    let startPage = Math.max(1, currentPage - halfVisible);
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }

    return pages;
  };

  const visiblePages = getVisiblePages();
  const isFirstPage = currentPage === 1;
  const isLastPage = currentPage === totalPages;

  return (
    <>
      {/* Mobile pagination */}
      <Flex justify="space-between" display={{ base: "flex", md: "none" }}>
        <Button
          onClick={() => onPageChange(currentPage - 1)}
          isDisabled={isFirstPage}
          size="sm"
          variant="outline"
          leftIcon={
            <svg width="16" height="16" viewBox="0 0 20 20" fill="currentColor">
              <path
                fillRule="evenodd"
                d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z"
                clipRule="evenodd"
              />
            </svg>
          }
        >
          Previous
        </Button>
        <Flex align="center" px={4}>
          <Text fontSize="sm" color="gray.600" fontWeight="medium">
            {currentPage} of {totalPages}
          </Text>
        </Flex>
        <Button
          onClick={() => onPageChange(currentPage + 1)}
          isDisabled={isLastPage}
          size="sm"
          variant="outline"
          rightIcon={
            <svg width="16" height="16" viewBox="0 0 20 20" fill="currentColor">
              <path
                fillRule="evenodd"
                d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                clipRule="evenodd"
              />
            </svg>
          }
        >
          Next
        </Button>
      </Flex>

      {/* Desktop pagination */}
      <Flex
        justify="space-between"
        align="center"
        display={{ base: "none", md: "flex" }}
      >
        <Text fontSize="sm" color="gray.600">
          Showing{" "}
          <Text as="span" fontWeight="semibold" color="gray.900">
            {startItem}
          </Text>{" "}
          to{" "}
          <Text as="span" fontWeight="semibold" color="gray.900">
            {endItem}
          </Text>{" "}
          of{" "}
          <Text as="span" fontWeight="semibold" color="gray.900">
            {totalItems}
          </Text>{" "}
          results
        </Text>

        <Flex align="center" gap={1}>
          {/* Previous button */}
          <IconButton
            aria-label="Previous page"
            onClick={() => onPageChange(currentPage - 1)}
            isDisabled={isFirstPage}
            size="sm"
            variant="ghost"
            color="gray.600"
            _hover={{ bg: "gray.100" }}
            _disabled={{ opacity: 0.4 }}
          >
            <svg width="16" height="16" viewBox="0 0 20 20" fill="currentColor">
              <path
                fillRule="evenodd"
                d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z"
                clipRule="evenodd"
              />
            </svg>
          </IconButton>

          {/* First page button (if not visible in range) */}
          {visiblePages[0] > 1 && (
            <>
              <Button
                onClick={() => onPageChange(1)}
                size="sm"
                variant="ghost"
                color="gray.600"
                _hover={{ bg: "gray.100" }}
                minW="8"
              >
                1
              </Button>
              {visiblePages[0] > 2 && (
                <Text color="gray.400" px={2} fontSize="sm">
                  ...
                </Text>
              )}
            </>
          )}

          {/* Visible page numbers */}
          {visiblePages.map((pageNum) => (
            <Button
              key={pageNum}
              onClick={() => onPageChange(pageNum)}
              size="sm"
              variant={currentPage === pageNum ? "solid" : "ghost"}
              colorScheme={currentPage === pageNum ? "indigo" : undefined}
              color={currentPage === pageNum ? "white" : "gray.600"}
              _hover={currentPage === pageNum ? {} : { bg: "gray.100" }}
              fontWeight={currentPage === pageNum ? "semibold" : "normal"}
              minW="8"
            >
              {pageNum}
            </Button>
          ))}

          {/* Last page button (if not visible in range) */}
          {visiblePages[visiblePages.length - 1] < totalPages && (
            <>
              {visiblePages[visiblePages.length - 1] < totalPages - 1 && (
                <Text color="gray.400" px={2} fontSize="sm">
                  ...
                </Text>
              )}
              <Button
                onClick={() => onPageChange(totalPages)}
                size="sm"
                variant="ghost"
                color="gray.600"
                _hover={{ bg: "gray.100" }}
                minW="8"
              >
                {totalPages}
              </Button>
            </>
          )}

          {/* Next button */}
          <IconButton
            aria-label="Next page"
            onClick={() => onPageChange(currentPage + 1)}
            isDisabled={isLastPage}
            size="sm"
            variant="ghost"
            color="gray.600"
            _hover={{ bg: "gray.100" }}
            _disabled={{ opacity: 0.4 }}
          >
            <svg width="16" height="16" viewBox="0 0 20 20" fill="currentColor">
              <path
                fillRule="evenodd"
                d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                clipRule="evenodd"
              />
            </svg>
          </IconButton>
        </Flex>
      </Flex>
    </>
  );
};

export default Pagination;
