package com.coffeehub.dto.response;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class TableQRResponse {
    private String tableToken;
    private String qrCodeUrl;
    private String qrCodeDataUrl;
}