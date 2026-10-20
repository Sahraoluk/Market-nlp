#Similarity Example

from gensim.models import KeyedVectors

print("Model Yükleniyor...")
kelimeVektoru = KeyedVectors.load_word2vec_format('trModel100', binary=True)
print(kelimeVektoru)

def benzerlikHesapla():

    anahtarKelime1 = input("İlk Anahtar Kelime: ").lower()
    anahtarKelime2 = input("İkinci Anahtar Kelime: ").lower()

    benzerlik = (kelimeVektoru.similarity(anahtarKelime1, anahtarKelime2))
    print(benzerlik)
    print("----------")
    benzerlikHesapla()

benzerlikHesapla()