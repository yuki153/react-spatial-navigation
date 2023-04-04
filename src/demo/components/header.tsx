import styled from "@emotion/styled";
import { withFocusable, FocusableProps } from "../../lib";

const StyledHeader = styled.div<FocusableProps & {color: string}>`
    color: ${(props) => props.color};
    width: 100%;
    height: 100%;
    max-height: 100px;
    background-color: ${({ focused }) => focused ? "blue" : "#333"};
`;

export const FocusableHeader = withFocusable()(StyledHeader);