package com.krushimart.common;

import com.krushimart.common.exception.GlobalExceptionHandler;
import com.krushimart.common.response.ApiError;
import org.junit.jupiter.api.Test;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

import java.sql.SQLException;

import static org.assertj.core.api.Assertions.assertThat;

class GlobalExceptionHandlerTest {

    private final GlobalExceptionHandler handler = new GlobalExceptionHandler();

    @Test
    void uniqueConstraintViolationBecomesConflictWithoutLeakingSql() {
        DataIntegrityViolationException exception = new DataIntegrityViolationException(
                "could not execute statement",
                new SQLException("duplicate key value violates unique constraint \"uk_users_phone\"", "23505"));

        ResponseEntity<ApiError> response = handler.handleDataIntegrity(exception);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.CONFLICT);
        assertThat(response.getBody()).isNotNull();
        assertThat(response.getBody().code()).isEqualTo("CONFLICT");
        assertThat(response.getBody().message()).doesNotContain("uk_users_phone", "duplicate key");
    }

    @Test
    void checkConstraintViolationBecomesBadRequestWithoutLeakingSql() {
        DataIntegrityViolationException exception = new DataIntegrityViolationException(
                "could not execute statement",
                new SQLException("check constraint \"ck_products_price\" violated", "23514"));

        ResponseEntity<ApiError> response = handler.handleDataIntegrity(exception);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.BAD_REQUEST);
        assertThat(response.getBody()).isNotNull();
        assertThat(response.getBody().code()).isEqualTo("INVALID_REQUEST");
        assertThat(response.getBody().message()).doesNotContain("ck_products_price");
    }

    @Test
    void unexpectedErrorsDoNotExposeInternalDetails() {
        ResponseEntity<ApiError> response = handler.handleUnexpected(
                new RuntimeException("secret internal database detail"));

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.INTERNAL_SERVER_ERROR);
        assertThat(response.getBody()).isNotNull();
        assertThat(response.getBody().code()).isEqualTo("INTERNAL_ERROR");
        assertThat(response.getBody().message())
                .isEqualTo("An unexpected error occurred")
                .doesNotContain("secret");
    }
}
