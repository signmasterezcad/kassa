package android.webkit;
// Yalnız kompilyasiya üçün (APK-ya düşmür): android-4.1.1.4 stub-unda Android 5+ fayl seçmə API-si yoxdur.
public class WebChromeClient {
    public WebChromeClient() {}
    public boolean onShowFileChooser(WebView webView, ValueCallback<android.net.Uri[]> filePathCallback, FileChooserParams fileChooserParams) { return false; }
    public static abstract class FileChooserParams {
        public FileChooserParams() {}
        public abstract android.content.Intent createIntent();
    }
}
