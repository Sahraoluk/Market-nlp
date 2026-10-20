#Most Similar Examples

from gensim.models import KeyedVectors

print("Model Yükleniyor...")
kelimeVektoru = KeyedVectors.load_word2vec_format('trModel100', binary=True)
print(kelimeVektoru)

def benzerKelimeler():

    anahtarKelime = input("Anahtar Kelime: ").lower()
    print("Girilen Kelime : "+ str(anahtarKelime))
    oneriler = (kelimeVektoru.most_similar(positive=anahtarKelime))
    print(oneriler)

    # İlk 10 öneriyi göster
    for index, oneri in enumerate(oneriler):
        print(index+1, oneri[0])

    # İlk 3 öneriyi göster
    '''
    for i in range(3):
        print(oneriler[i][0])
    '''

    '''
    for i in range(3):
        onerilenKelime = oneriler[i][0]
        print("https://www.google.com.tr/search?q="+onerilenKelime)

    '''
    benzerKelimeler()

benzerKelimeler()