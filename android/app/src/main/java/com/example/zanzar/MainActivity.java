package com.example.zanzar;

import android.os.Bundle;
import android.view.View;
import android.webkit.WebView;
import android.view.WindowInsets;
import android.view.WindowInsetsController;
import androidx.core.view.WindowCompat;
import androidx.core.view.WindowInsetsCompat;
import androidx.core.view.WindowInsetsControllerCompat;
import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {
    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        
        // Configura a janela para respeitar a área segura
        WindowCompat.setDecorFitsSystemWindows(getWindow(), false);
        
        // Configura o controlador de insets
        WindowInsetsControllerCompat windowInsetsController = WindowCompat.getInsetsController(getWindow(), getWindow().getDecorView());
        windowInsetsController.setSystemBarsBehavior(WindowInsetsControllerCompat.BEHAVIOR_SHOW_TRANSIENT_BARS_BY_SWIPE);
        
        // Configura a WebView para respeitar a área segura
        WebView webView = findViewById(R.id.webview);
        if (webView != null) {
            webView.setOnApplyWindowInsetsListener((view, windowInsets) -> {
                WindowInsets insets = windowInsets.getInsets(WindowInsetsCompat.Type.systemBars());
                view.setPadding(insets.left, insets.top, insets.right, insets.bottom);
                return windowInsets;
            });
        }
    }
}
