package com.northline.store.catalog;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class AdminCatalogSecurityIntegrationTest {

  @Autowired
  MockMvc mvc;

  @Test
  void catalogManagementRequiresAnAdministrator() throws Exception {
    mvc.perform(get("/api/admin/catalog/products")).andExpect(status().isUnauthorized());
  }

  @Test
  @WithMockUser(roles = "USER")
  void regularUsersCannotAccessCatalogManagement() throws Exception {
    mvc.perform(get("/api/admin/catalog/products")).andExpect(status().isForbidden());
  }

  @Test
  @WithMockUser(roles = "ADMIN")
  void administratorsCanAccessCatalogManagement() throws Exception {
    mvc.perform(get("/api/admin/catalog/products")).andExpect(status().isOk());
  }
}
