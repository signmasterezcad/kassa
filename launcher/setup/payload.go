package main

// KASSA quraşdırıcısı (KASSA-Setup.exe): proqram fayllarını öz içində daşıyır.
// payload/ qovluğunu build-setup.sh doldurur (KASSA.exe, app/..., YENILE.bat, yenile.ps1).
// Bu fayl Windows-dan asılı deyil — çıxarma (extract) Linux-da test olunur.

import (
	"embed"
	"io/fs"
	"os"
	"path/filepath"
	"strings"
)

//go:embed all:payload
var payload embed.FS

// Versiya build-setup.sh tərəfindən -ldflags "-X main.version=..." ilə yazılır.
var version = "0"

// extract proqram fayllarını dst qovluğuna yazır. Məlumata (%APPDATA%\KASSA) və ehtiyat\ qovluğuna toxunmur.
func extract(dst string) (int, error) {
	n := 0
	err := fs.WalkDir(payload, "payload", func(p string, d fs.DirEntry, err error) error {
		if err != nil {
			return err
		}
		rel := strings.TrimPrefix(strings.TrimPrefix(p, "payload"), "/")
		if rel == "" || rel == ".keep" {
			return nil
		}
		target := filepath.Join(dst, filepath.FromSlash(rel))
		if d.IsDir() {
			return os.MkdirAll(target, 0o755)
		}
		b, err := payload.ReadFile(p)
		if err != nil {
			return err
		}
		if err := os.MkdirAll(filepath.Dir(target), 0o755); err != nil {
			return err
		}
		tmp := target + ".yeni"
		if err := os.WriteFile(tmp, b, 0o755); err != nil {
			return err
		}
		if err := os.Rename(tmp, target); err != nil { // işləyən exe-nin üstünə yazmaq olmur
			os.Remove(tmp)
			return err
		}
		n++
		return nil
	})
	return n, err
}

// payloadSize quraşdırılan faylların cəmi ölçüsü (KB) — "Proqramlar" siyahısı üçün.
func payloadSize() int {
	total := 0
	fs.WalkDir(payload, "payload", func(p string, d fs.DirEntry, err error) error {
		if err == nil && !d.IsDir() {
			if i, e := d.Info(); e == nil {
				total += int(i.Size())
			}
		}
		return nil
	})
	return total / 1024
}

// kassaFiles silinərkən toxunulan adlar (ehtiyat\ və uninstall.exe-dən başqa) — yalnız bunlar silinir.
var kassaFiles = []string{"app", "app.evvelki", "KASSA.exe", "KASSA.exe.evvelki", "KASSA.exe.yeni", "YENILE.bat", "yenile.ps1", "KASSA.lnk"}

// isKassaDir qovluğun həqiqətən KASSA qovluğu olduğunu yoxlayır (KASSA.exe və app\index.html var).
func isKassaDir(dir string) bool {
	if _, err := os.Stat(filepath.Join(dir, "KASSA.exe")); err != nil {
		return false
	}
	_, err := os.Stat(filepath.Join(dir, "app", "index.html"))
	return err == nil
}
