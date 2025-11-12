"use client";
import styled from "styled-components";

export const StyledDropdown = styled.select`
  padding: 0.5rem 0.75rem;
  background-color: var(--color-bg);
  color: var(--color-fg);
  border: 1px solid rgba(128, 128, 128, 0.3);
  border-radius: 0.375rem;
  font-size: 0.875rem;
  cursor: pointer;
  transition: border-color 0.2s ease;

  &:hover {
    border-color: rgba(128, 128, 128, 0.5);
  }

  &:focus {
    outline: none;
    border-color: #3b82f6;
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
  }
`;
