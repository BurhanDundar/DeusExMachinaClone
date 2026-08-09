INSERT INTO categories (id, name, slug, description, sort_order) VALUES
    ('00000000-0000-0000-0000-000000000101', 'Giyim', 'giyim', 'Atölye ruhundan gelen günlük giyim parçaları.', 1),
    ('00000000-0000-0000-0000-000000000102', 'Aksesuar', 'aksesuar', 'Yol ve atölye için tamamlayıcı ürünler.', 2),
    ('00000000-0000-0000-0000-000000000103', 'Defterler', 'defterler', 'Binks grafiklerini taşıyan cep defterleri.', 3),
    ('00000000-0000-0000-0000-000000000104', 'Setler', 'setler', 'Hediye edilebilen Binks koleksiyonları.', 4);

INSERT INTO products (
    id, category_id, name, slug, description, status, base_price, badge, featured, sort_order
) VALUES
    (
        '00000000-0000-0000-0000-000000000201',
        '00000000-0000-0000-0000-000000000102',
        'Kırmızı Paisley Bandana',
        'kirmizi-paisley-bandana',
        'Koyu zemin üzerinde kırmızı paisley çizgileri taşıyan, günlük kullanıma uygun Binks bandanası.',
        'ACTIVE', 349.00, 'YENİ', TRUE, 1
    ),
    (
        '00000000-0000-0000-0000-000000000202',
        '00000000-0000-0000-0000-000000000102',
        'Dövme Makinesi Bandanası',
        'dovme-makinesi-bandana',
        'Dövme makinesi ve motor bloğu çizimleriyle hazırlanan sınırlı Binks bandanası.',
        'ACTIVE', 349.00, 'YENİ', TRUE, 2
    ),
    (
        '00000000-0000-0000-0000-000000000203',
        '00000000-0000-0000-0000-000000000102',
        'Kırmızı Gölge Bandanası',
        'kirmizi-golge-bandana',
        'Siyah zemin üzerinde kırmızı geçiş deseni ve Binks imzası bulunan minimal bandana.',
        'ACTIVE', 329.00, NULL, TRUE, 3
    ),
    (
        '00000000-0000-0000-0000-000000000204',
        '00000000-0000-0000-0000-000000000101',
        'Kömür Ekose İş Gömleği',
        'komur-ekose-is-gomlegi',
        'Kömür tonlarında ekose dokusu ve göğüste Binks nakışıyla tamamlanan iş gömleği.',
        'ACTIVE', 1199.00, 'YENİ', TRUE, 4
    ),
    (
        '00000000-0000-0000-0000-000000000205',
        '00000000-0000-0000-0000-000000000101',
        'Füme İş Gömleği',
        'fume-is-gomlegi',
        'Füme renkli, göğüs cepli ve kırmızı Binks nakışlı günlük iş gömleği.',
        'ACTIVE', 1099.00, NULL, TRUE, 5
    ),
    (
        '00000000-0000-0000-0000-000000000206',
        '00000000-0000-0000-0000-000000000101',
        'Mekanik Sanat Tişörtü',
        'mekanik-sanat-tisortu',
        'Önde küçük Binks nakışı, arkada motor ve dövme makinesi illüstrasyonu bulunan siyah tişört.',
        'ACTIVE', 749.00, 'YENİ', TRUE, 6
    ),
    (
        '00000000-0000-0000-0000-000000000207',
        '00000000-0000-0000-0000-000000000102',
        'Motor Nakışlı Şapka',
        'motor-nakisli-sapka',
        'Kırmızı motor bloğu ve Binks karakter nakışıyla tamamlanan siyah şapka.',
        'ACTIVE', 549.00, 'YENİ', TRUE, 7
    ),
    (
        '00000000-0000-0000-0000-000000000208',
        '00000000-0000-0000-0000-000000000102',
        'Kabartmalı Siyah Şapka',
        'kabartmali-siyah-sapka',
        'Ton sür ton kabartma motor ve dövme çizimleriyle hazırlanan siyah şapka.',
        'ACTIVE', 579.00, 'ÖZEL', FALSE, 8
    ),
    (
        '00000000-0000-0000-0000-000000000209',
        '00000000-0000-0000-0000-000000000101',
        'Siyah Denim Atölye Önlüğü',
        'siyah-denim-atolye-onlugu',
        'Kırmızı dikiş detayları, geniş cepler ve Binks karakter nakışıyla üretilen denim önlük.',
        'ACTIVE', 899.00, 'ÖZEL', FALSE, 9
    ),
    (
        '00000000-0000-0000-0000-000000000210',
        '00000000-0000-0000-0000-000000000103',
        'Binks Cep Defteri',
        'binks-cep-defteri',
        'Atölye, motor ve yol temalı farklı kapak seçenekleri bulunan Binks cep defteri.',
        'ACTIVE', 179.00, 'YENİ', TRUE, 10
    ),
    (
        '00000000-0000-0000-0000-000000000211',
        '00000000-0000-0000-0000-000000000103',
        'Mekanik Sanat Defteri',
        'mekanik-sanat-defteri',
        'Motor bloğu ve dövme makinesi grafiğiyle kaplanan, Binks imzalı defter.',
        'ACTIVE', 199.00, NULL, FALSE, 11
    ),
    (
        '00000000-0000-0000-0000-000000000212',
        '00000000-0000-0000-0000-000000000102',
        'Binks Anahtarlık',
        'binks-anahtarlik',
        'Kırmızı Binks karakteri ve dokuma logolu dayanıklı anahtarlık.',
        'ACTIVE', 149.00, NULL, FALSE, 12
    ),
    (
        '00000000-0000-0000-0000-000000000213',
        '00000000-0000-0000-0000-000000000104',
        'Binks Koleksiyon Seti',
        'binks-koleksiyon-seti',
        'Gömlek, şapka, bandana, anahtarlık ve seçili atölye ürünlerinden oluşan Binks seti.',
        'ACTIVE', 2199.00, 'SINIRLI SET', FALSE, 13
    );

INSERT INTO product_images (id, product_id, url, alt_text, sort_order) VALUES
    ('00000000-0000-0000-0000-000000000401', '00000000-0000-0000-0000-000000000201', '/products/binks/bandana-paisley-koleksiyonu.jpeg', 'Kırmızı Paisley Bandana', 1),
    ('00000000-0000-0000-0000-000000000402', '00000000-0000-0000-0000-000000000201', '/products/binks/bandana-paisley-koleksiyonu-detay.jpeg', 'Kırmızı Paisley Bandana desenleri', 2),
    ('00000000-0000-0000-0000-000000000403', '00000000-0000-0000-0000-000000000202', '/products/binks/bandana-dovme-makinesi.jpeg', 'Dövme Makinesi Bandanası', 1),
    ('00000000-0000-0000-0000-000000000404', '00000000-0000-0000-0000-000000000202', '/products/binks/atolye-seti.jpeg', 'Dövme Makinesi Bandanası detayları', 2),
    ('00000000-0000-0000-0000-000000000405', '00000000-0000-0000-0000-000000000203', '/products/binks/bandana-kirmizi-golge.jpeg', 'Kırmızı Gölge Bandanası', 1),
    ('00000000-0000-0000-0000-000000000406', '00000000-0000-0000-0000-000000000203', '/products/binks/bandana-kirmizi-golge-detay.jpeg', 'Kırmızı Gölge Bandanası detayları', 2),
    ('00000000-0000-0000-0000-000000000407', '00000000-0000-0000-0000-000000000204', '/products/binks/gomlek-komur-ekose.jpeg', 'Kömür Ekose İş Gömleği', 1),
    ('00000000-0000-0000-0000-000000000408', '00000000-0000-0000-0000-000000000205', '/products/binks/gomlek-fume-is.jpeg', 'Füme İş Gömleği', 1),
    ('00000000-0000-0000-0000-000000000409', '00000000-0000-0000-0000-000000000206', '/products/binks/tisort-mekanik-sanat.jpeg', 'Mekanik Sanat Tişörtü', 1),
    ('00000000-0000-0000-0000-000000000410', '00000000-0000-0000-0000-000000000207', '/products/binks/sapka-motor-nakis.jpeg', 'Motor Nakışlı Şapka', 1),
    ('00000000-0000-0000-0000-000000000411', '00000000-0000-0000-0000-000000000208', '/products/binks/sapka-kabartma-siyah.jpeg', 'Kabartmalı Siyah Şapka', 1),
    ('00000000-0000-0000-0000-000000000412', '00000000-0000-0000-0000-000000000209', '/products/binks/atolye-seti.jpeg', 'Siyah Denim Atölye Önlüğü', 1),
    ('00000000-0000-0000-0000-000000000413', '00000000-0000-0000-0000-000000000210', '/products/binks/defter-kapak-secenekleri.jpeg', 'Binks Cep Defteri kapak seçenekleri', 1),
    ('00000000-0000-0000-0000-000000000414', '00000000-0000-0000-0000-000000000210', '/products/binks/defter-kapak-secenekleri-detay.jpeg', 'Binks Cep Defteri detayları', 2),
    ('00000000-0000-0000-0000-000000000415', '00000000-0000-0000-0000-000000000211', '/products/binks/defter-mekanik-sanat.jpeg', 'Mekanik Sanat Defteri', 1),
    ('00000000-0000-0000-0000-000000000416', '00000000-0000-0000-0000-000000000212', '/products/binks/anahtarlik-binks.jpeg', 'Binks Anahtarlık', 1),
    ('00000000-0000-0000-0000-000000000417', '00000000-0000-0000-0000-000000000213', '/products/binks/koleksiyon-seti.jpeg', 'Binks Koleksiyon Seti', 1),
    ('00000000-0000-0000-0000-000000000418', '00000000-0000-0000-0000-000000000213', '/products/binks/kutu-binks.jpeg', 'Binks Koleksiyon Seti kutusu', 2);

INSERT INTO product_variants (
    id, product_id, title, sku, color, size, stock_quantity, sort_order
) VALUES
    ('00000000-0000-0000-0000-000000000501', '00000000-0000-0000-0000-000000000201', 'Standart', 'BNK-BND-PAISLEY-STD', 'Siyah / Kırmızı', NULL, 24, 1),
    ('00000000-0000-0000-0000-000000000502', '00000000-0000-0000-0000-000000000202', 'Standart', 'BNK-BND-TATTOO-STD', 'Siyah / Kırmızı', NULL, 18, 1),
    ('00000000-0000-0000-0000-000000000503', '00000000-0000-0000-0000-000000000203', 'Standart', 'BNK-BND-SHADOW-STD', 'Siyah / Kırmızı', NULL, 20, 1),
    ('00000000-0000-0000-0000-000000000504', '00000000-0000-0000-0000-000000000204', 'S', 'BNK-SHIRT-COAL-S', 'Kömür Ekose', 'S', 6, 1),
    ('00000000-0000-0000-0000-000000000505', '00000000-0000-0000-0000-000000000204', 'M', 'BNK-SHIRT-COAL-M', 'Kömür Ekose', 'M', 9, 2),
    ('00000000-0000-0000-0000-000000000506', '00000000-0000-0000-0000-000000000204', 'L', 'BNK-SHIRT-COAL-L', 'Kömür Ekose', 'L', 8, 3),
    ('00000000-0000-0000-0000-000000000507', '00000000-0000-0000-0000-000000000204', 'XL', 'BNK-SHIRT-COAL-XL', 'Kömür Ekose', 'XL', 5, 4),
    ('00000000-0000-0000-0000-000000000508', '00000000-0000-0000-0000-000000000205', 'S', 'BNK-SHIRT-SMOKE-S', 'Füme', 'S', 7, 1),
    ('00000000-0000-0000-0000-000000000509', '00000000-0000-0000-0000-000000000205', 'M', 'BNK-SHIRT-SMOKE-M', 'Füme', 'M', 9, 2),
    ('00000000-0000-0000-0000-000000000510', '00000000-0000-0000-0000-000000000205', 'L', 'BNK-SHIRT-SMOKE-L', 'Füme', 'L', 8, 3),
    ('00000000-0000-0000-0000-000000000511', '00000000-0000-0000-0000-000000000205', 'XL', 'BNK-SHIRT-SMOKE-XL', 'Füme', 'XL', 5, 4),
    ('00000000-0000-0000-0000-000000000512', '00000000-0000-0000-0000-000000000206', 'S', 'BNK-TEE-ART-S', 'Siyah', 'S', 10, 1),
    ('00000000-0000-0000-0000-000000000513', '00000000-0000-0000-0000-000000000206', 'M', 'BNK-TEE-ART-M', 'Siyah', 'M', 14, 2),
    ('00000000-0000-0000-0000-000000000514', '00000000-0000-0000-0000-000000000206', 'L', 'BNK-TEE-ART-L', 'Siyah', 'L', 12, 3),
    ('00000000-0000-0000-0000-000000000515', '00000000-0000-0000-0000-000000000206', 'XL', 'BNK-TEE-ART-XL', 'Siyah', 'XL', 8, 4),
    ('00000000-0000-0000-0000-000000000516', '00000000-0000-0000-0000-000000000207', 'Standart', 'BNK-CAP-MOTOR-STD', 'Siyah / Kırmızı', NULL, 16, 1),
    ('00000000-0000-0000-0000-000000000517', '00000000-0000-0000-0000-000000000208', 'Standart', 'BNK-CAP-EMBOSS-STD', 'Siyah', NULL, 12, 1),
    ('00000000-0000-0000-0000-000000000518', '00000000-0000-0000-0000-000000000209', 'Standart', 'BNK-APRON-DENIM-STD', 'Siyah', NULL, 8, 1),
    ('00000000-0000-0000-0000-000000000519', '00000000-0000-0000-0000-000000000210', 'Yol Senin', 'BNK-NOTE-ROAD', 'Lacivert', NULL, 8, 1),
    ('00000000-0000-0000-0000-000000000520', '00000000-0000-0000-0000-000000000210', 'Mekanik Ruh', 'BNK-NOTE-SOUL', 'Siyah', NULL, 8, 2),
    ('00000000-0000-0000-0000-000000000521', '00000000-0000-0000-0000-000000000210', 'Özgür Sürüş', 'BNK-NOTE-RIDE', 'Gri', NULL, 8, 3),
    ('00000000-0000-0000-0000-000000000522', '00000000-0000-0000-0000-000000000210', 'İki Teker Bir Dünya', 'BNK-NOTE-WHEELS', 'Kırmızı', NULL, 8, 4),
    ('00000000-0000-0000-0000-000000000523', '00000000-0000-0000-0000-000000000210', 'Rotanı Bul', 'BNK-NOTE-PATH', 'Lacivert', NULL, 8, 5),
    ('00000000-0000-0000-0000-000000000524', '00000000-0000-0000-0000-000000000211', 'Standart', 'BNK-NOTE-ART-STD', 'Siyah', NULL, 10, 1),
    ('00000000-0000-0000-0000-000000000525', '00000000-0000-0000-0000-000000000212', 'Standart', 'BNK-KEYRING-STD', 'Siyah / Kırmızı', NULL, 30, 1),
    ('00000000-0000-0000-0000-000000000526', '00000000-0000-0000-0000-000000000213', 'Standart', 'BNK-SET-STD', 'Çok Renkli', NULL, 5, 1);
