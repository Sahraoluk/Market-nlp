#Most Similar Rafine

from gensim.models import KeyedVectors

print("Model Yükleniyor...")
kelimeVektoru = KeyedVectors.load_word2vec_format('trModel100', binary=True)
print(kelimeVektoru)

def benzerKelimeler():

    anahtarKelime = input("Anahtar Kelime: ").lower()
    print("Girilen Kelime : "+ str(anahtarKelime))
    oneriler = (kelimeVektoru.most_similar(positive=anahtarKelime))
    print(oneriler)

    # Önerileri rafine et
    for oneri in oneriler:
        if anahtarKelime not in oneri[0]:
            print(oneri[0])

    benzerKelimeler()

benzerKelimeler()