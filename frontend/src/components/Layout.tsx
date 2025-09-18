import React from "react";
import { Link as RouterLink, useLocation } from "react-router-dom";
import {
  Box,
  Flex,
  Heading,
  HStack,
  Icon,
  Text,
  Container
} from "@chakra-ui/react";
import {
  DocumentTextIcon,
  MagnifyingGlassIcon,
  FolderIcon,
} from "@heroicons/react/24/outline";

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const location = useLocation();

  const navigation = [
    { name: "Upload", href: "/", icon: DocumentTextIcon },
    { name: "Search", href: "/search", icon: MagnifyingGlassIcon },
    { name: "Files", href: "/files", icon: FolderIcon },
  ];

  return (
    <Box minH="100vh" bg="gray.50">
      <Box as="nav" bg="white" shadow="sm" borderBottom="1px" borderColor="gray.200">
        <Container maxW="7xl" px={{ base: 4, sm: 6, lg: 8 }}>
          <Flex justify="space-between" h="16">
            <Flex>
              <Flex shrink={0} align="center">
                <Heading as="h1" size="lg" fontWeight="bold" color="gray.900">
                  File Search
                </Heading>
              </Flex>
              <HStack ml={6} spacing={8}>
                {navigation.map((item) => {
                  const IconComponent = item.icon;
                  const isActive = location.pathname === item.href;

                  return (
                    <RouterLink
                      key={item.name}
                      to={item.href}
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        padding: "4px 4px 8px 4px",
                        borderBottom: `2px solid ${isActive ? "#4f46e5" : "transparent"}`,
                        fontSize: "14px",
                        fontWeight: 500,
                        color: isActive ? "#111827" : "#6b7280",
                        textDecoration: "none"
                      }}
                      onMouseEnter={(e) => {
                        if (!isActive) {
                          (e.target as HTMLAnchorElement).style.color = "#374151";
                          (e.target as HTMLAnchorElement).style.borderBottomColor = "#d1d5db";
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (!isActive) {
                          (e.target as HTMLAnchorElement).style.color = "#6b7280";
                          (e.target as HTMLAnchorElement).style.borderBottomColor = "transparent";
                        }
                      }}
                    >
                      <Icon as={IconComponent} w={4} h={4} mr={2} />
                      <Text>{item.name}</Text>
                    </RouterLink>
                  );
                })}
              </HStack>
            </Flex>
          </Flex>
        </Container>
      </Box>

      <Box as="main" py={8}>
        <Container maxW="7xl" px={{ base: 4, sm: 6, lg: 8 }}>
          {children}
        </Container>
      </Box>
    </Box>
  );
};

export default Layout;
