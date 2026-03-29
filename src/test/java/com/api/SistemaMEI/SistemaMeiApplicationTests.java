package com.api.SistemaMEI;

import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.assertNotNull;

class SistemaMeiApplicationTests extends IntegrationTestBase{

	@Test
	void contextLoads() {
		assertNotNull(postgres, "Container PostgreSQL deveriaestar rodando");
	}
}
